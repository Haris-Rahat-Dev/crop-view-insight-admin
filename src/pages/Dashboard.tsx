
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    totalUsers: number;
    userRoles: {name: string, value: number}[];
    totalPredictions: number;
    predictionsByType: {name: string, value: number}[];
  }>({
    totalUsers: 0,
    userRoles: [],
    totalPredictions: 0,
    predictionsByType: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Count users by role
        const roles: Record<string, number> = {};
        users.forEach((user: DocumentData) => {
          const role = user.role || 'farmer';
          roles[role] = (roles[role] || 0) + 1;
        });
        
        // Transform roles for chart
        const userRolesData = Object.entries(roles).map(([name, value]) => ({ name, value }));
        
        // Fetch predictions
        const predictionsSnapshot = await getDocs(collection(db, "user_prediction"));
        const predictions = predictionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Count predictions by type
        const predictionTypes: Record<string, number> = {};
        predictions.forEach((prediction: DocumentData) => {
          const type = prediction.crop_type || 'unknown';
          predictionTypes[type] = (predictionTypes[type] || 0) + 1;
        });
        
        // Transform prediction types for chart
        const predictionTypeData = Object.entries(predictionTypes).map(([name, value]) => ({ name, value }));
        
        setDashboardData({
          totalUsers: users.length,
          userRoles: userRolesData,
          totalPredictions: predictions.length,
          predictionsByType: predictionTypeData
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ['#3b9f4b', '#5ebe70', '#92daa0', '#c5eecd', '#2d7e3c', '#236031'];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle className="dashboard-card-title">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dashboard-card-value">{dashboardData.totalUsers}</div>
          </CardContent>
        </Card>
        
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
            <CardTitle className="dashboard-card-title">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dashboard-card-value">
              {dashboardData.userRoles.find(role => role.name === 'admin')?.value || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle className="dashboard-card-title">Farmers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="dashboard-card-value">
              {dashboardData.userRoles.find(role => role.name === 'farmer')?.value || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="dashboard-card">
          <CardHeader className="dashboard-card-header">
            <CardTitle>User Distribution by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.userRoles}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {dashboardData.userRoles.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
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
                  <Bar dataKey="value" fill="#3b9f4b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
