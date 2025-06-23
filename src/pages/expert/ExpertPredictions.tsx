
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Search, MessageSquare, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Prediction {
  id: string;
  user_id: string;
  user_email?: string;
  crop_type: string;
  confidence: number;
  result: string;
  timestamp: Date;
  expert_comment?: string;
}

const ExpertPredictions = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [comment, setComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPredictions = async () => {
      setIsLoading(true);
      try {
        const predictionsSnapshot = await getDocs(collection(db, "user_prediction"));
        
        // Get all users to map IDs to emails
        const usersSnapshot = await getDocs(collection(db, "users"));
        const userEmailMap: Record<string, string> = {};
        
        usersSnapshot.docs.forEach(doc => {
          userEmailMap[doc.id] = doc.data().email || 'Unknown';
        });
        
        // Process predictions data
        const predictionsData = predictionsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            user_id: data.user_id || '',
            user_email: userEmailMap[data.user_id] || 'Unknown User',
            crop_type: data.crop_type || 'Unknown',
            confidence: data.confidence || 0,
            result: data.result || 'No result',
            timestamp: data.timestamp?.toDate?.() || new Date(),
            expert_comment: data.expert_comment || ''
          };
        });
        
        // Sort by timestamp descending
        predictionsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setPredictions(predictionsData);
        setFilteredPredictions(predictionsData);
      } catch (error) {
        console.error("Error fetching predictions:", error);
        toast({
          title: "Error",
          description: "Failed to fetch predictions.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, [toast]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPredictions(predictions);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = predictions.filter(prediction => 
        prediction.user_email.toLowerCase().includes(lowercasedSearch) ||
        prediction.crop_type.toLowerCase().includes(lowercasedSearch) ||
        prediction.result.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredPredictions(filtered);
    }
  }, [searchTerm, predictions]);

  const handleAddComment = (prediction: Prediction) => {
    setSelectedPrediction(prediction);
    setComment(prediction.expert_comment || '');
    setDialogOpen(true);
  };

  const handleSaveComment = async () => {
    if (!selectedPrediction || !comment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const predictionRef = doc(db, "user_prediction", selectedPrediction.id);
      await updateDoc(predictionRef, {
        expert_comment: comment.trim()
      });

      // Update local state
      const updatedPredictions = predictions.map(p => 
        p.id === selectedPrediction.id 
          ? { ...p, expert_comment: comment.trim() }
          : p
      );
      setPredictions(updatedPredictions);
      setFilteredPredictions(updatedPredictions);

      toast({
        title: "Success",
        description: "Comment added successfully."
      });

      setDialogOpen(false);
      setSelectedPrediction(null);
      setComment('');
    } catch (error) {
      console.error("Error saving comment:", error);
      toast({
        title: "Error",
        description: "Failed to save comment.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Review Predictions</h1>
        <div className="flex">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search predictions..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Predictions ({filteredPredictions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPredictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No predictions found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Crop Type</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPredictions.map((prediction) => (
                  <TableRow key={prediction.id}>
                    <TableCell>{prediction.user_email}</TableCell>
                    <TableCell>{prediction.crop_type}</TableCell>
                    <TableCell>{(prediction.confidence * 100).toFixed(1)}%</TableCell>
                    <TableCell>{prediction.result}</TableCell>
                    <TableCell>{formatDate(prediction.timestamp)}</TableCell>
                    <TableCell>
                      {prediction.expert_comment ? (
                        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Reviewed
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddComment(prediction)}
                        className="flex items-center gap-1"
                      >
                        {prediction.expert_comment ? <Eye size={14} /> : <MessageSquare size={14} />}
                        {prediction.expert_comment ? 'View' : 'Comment'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPrediction?.expert_comment ? 'View Comment' : 'Add Expert Comment'}
            </DialogTitle>
          </DialogHeader>
          {selectedPrediction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">User</Label>
                  <p className="text-sm">{selectedPrediction.user_email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Crop Type</Label>
                  <p className="text-sm">{selectedPrediction.crop_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Confidence</Label>
                  <p className="text-sm">{(selectedPrediction.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Result</Label>
                  <p className="text-sm">{selectedPrediction.result}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm">{formatDate(selectedPrediction.timestamp)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comment">Expert Comment</Label>
                <Textarea
                  id="comment"
                  placeholder="Enter your expert analysis and recommendations..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveComment} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Comment"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpertPredictions;
