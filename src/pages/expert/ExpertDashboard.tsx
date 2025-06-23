
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

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

const ExpertDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    totalPredictions: number;
    reviewedPredictions: number;
    pendingPredictions: number;
    predictionsByType: {name: string, value: number}[];
    recentPredictions: Prediction[];
  }>({
    totalPredictions: 0,
    reviewedPredictions: 0,
    pendingPredictions: 0,
    predictionsByType: [],
    recentPredictions: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch predictions
        const predictionsSnapshot = await getDocs(collection(db, "user_prediction"));
        
        // Get all users to map IDs to emails
        const usersSnapshot = await getDocs(collection(db, "users"));
        const userEmailMap: Record<string, string> = {};
        
        usersSnapshot.docs.forEach(doc => {
          userEmailMap[doc.id] = doc.data().email || 'Unknown';
        });
        
        // Process predictions data
        const predictions: Prediction[] = predictionsSnapshot.docs.map(doc => {
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
        predictions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Calculate stats
        const totalPredictions = predictions.length;
        const reviewedPredictions = predictions.filter(p => p.expert_comment).length;
        const pendingPredictions = totalPredictions - reviewedPredictions;

        // Count predictions by type
        const predictionTypes: Record<string, number> = {};
        predictions.forEach((prediction) => {
          const type = prediction.crop_type || 'unknown';
          predictionTypes[type] = (predictionTypes[type] || 0) + 1;
        });

        // Transform prediction types for chart
        const predictionTypeData = Object.entries(predictionTypes).map(([name, value]) => ({ name, value }));

        // Get recent predictions (last 5)
        const recentPredictions = predictions.slice(0, 5);

        setDashboardData({
          totalPredictions,
          reviewedPredictions,
          pendingPredictions,
          predictionsByType: predictionTypeData,
          recentPredictions
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#1d4ed8', '#1e40af'];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Expert Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle className="dashboard-card-title">Total Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dashboard-card-value">{dashboardData.totalPredictions}</div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle className="dashboard-card-title">Reviewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dashboard-card-value text-green-600">{dashboardData.reviewedPredictions}</div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle className="dashboard-card-title">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dashboard-card-value text-orange-600">{dashboardData.pendingPredictions}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle>Predictions by Crop Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.predictionsByType}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle>Review Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Reviewed', value: dashboardData.reviewedPredictions },
                      { name: 'Pending', value: dashboardData.pendingPredictions }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#f97316" />
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dashboard-card">
        <CardHeader className="dashboard-card-header">
          <CardTitle>Recent Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.recentPredictions.map((prediction) => (
              <div key={prediction.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{prediction.user_email}</p>
                    <p className="text-sm text-muted-foreground">
                      {prediction.crop_type} - {(prediction.confidence * 100).toFixed(1)}% confidence
                    </p>
                    <p className="text-sm">{prediction.result}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(prediction.timestamp)}
                    </p>
                    {prediction.expert_comment ? (
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Reviewed
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpertDashboard;
