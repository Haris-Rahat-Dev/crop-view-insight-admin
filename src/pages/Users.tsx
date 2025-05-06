
import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  predictions?: number;
  created_at?: any;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const predictionsSnapshot = await getDocs(collection(db, "user_prediction"));
        
        // Count predictions per user
        const predictionCounts: Record<string, number> = {};
        predictionsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const userId = data.user_id;
          if (userId) {
            predictionCounts[userId] = (predictionCounts[userId] || 0) + 1;
          }
        });
        
        // Map users with their prediction counts
        const usersData = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email || "N/A",
            name: data.name || "N/A",
            role: data.role || "farmer",
            predictions: predictionCounts[doc.id] || 0,
            created_at: data.created_at?.toDate?.() || new Date()
          };
        });
        
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(lowercasedSearch) ||
        (user.name && user.name.toLowerCase().includes(lowercasedSearch)) ||
        user.role.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const getBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'expert':
        return 'secondary';
      case 'farmer':
      default:
        return 'default';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="flex">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name/Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Predictions</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        {user.name !== "N/A" && (
                          <div className="font-medium">{user.name}</div>
                        )}
                        <div className={user.name !== "N/A" ? "text-sm text-muted-foreground" : ""}>
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.predictions}</TableCell>
                    <TableCell>
                      {formatDate(user.created_at)}
                    </TableCell>
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

export default Users;
