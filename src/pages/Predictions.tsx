
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Prediction {
  id: string;
  user_id: string;
  user_email?: string;
  crop_type: string;
  confidence: number;
  result: string;
  timestamp: Date;
}

const Predictions = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [predictionTrend, setPredictionTrend] = useState<{name: string, count: number}[]>([]);

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
            timestamp: data.timestamp?.toDate?.() || new Date()
          };
        });
        
        // Sort by timestamp descending
        predictionsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setPredictions(predictionsData);
        setFilteredPredictions(predictionsData);
        
        // Generate prediction trend data (predictions by month)
        const trendData: Record<string, number> = {};
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        predictionsData.forEach(prediction => {
          if (prediction.timestamp >= sixMonthsAgo) {
            const monthYear = `${prediction.timestamp.getMonth() + 1}/${prediction.timestamp.getFullYear()}`;
            trendData[monthYear] = (trendData[monthYear] || 0) + 1;
          }
        });
        
        // Convert to array and sort by date
        const trendArray = Object.entries(trendData)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => {
            const [aMonth, aYear] = a.name.split('/').map(Number);
            const [bMonth, bYear] = b.name.split('/').map(Number);
            return (aYear * 12 + aMonth) - (bYear * 12 + bMonth);
          });
          
        setPredictionTrend(trendArray);
      } catch (error) {
        console.error("Error fetching predictions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, []);

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
        <h1 className="text-3xl font-bold">Predictions</h1>
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
          <CardTitle>Prediction Trends (6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Predictions"
                  stroke="#3b9f4b" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Predictions ({filteredPredictions.length})</CardTitle>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Predictions;
