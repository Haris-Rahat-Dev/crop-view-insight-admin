
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Settings Updated",
      description: "Your dashboard settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Alert>
        <AlertTitle>Admin Dashboard</AlertTitle>
        <AlertDescription>
          Configure your dashboard settings. These settings only affect your admin dashboard experience.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="new-user-notifications" className="font-medium">
                New User Notifications
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Receive notifications when new users register.
              </p>
            </div>
            <Switch id="new-user-notifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="prediction-notifications" className="font-medium">
                Prediction Notifications
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Receive notifications when users make new predictions.
              </p>
            </div>
            <Switch id="prediction-notifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Receive notifications via email.
              </p>
            </div>
            <Switch id="email-notifications" />
          </div>
          
          <Button onClick={handleSaveSettings}>Save Notification Settings</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>
            Customize how data is displayed in the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="analytics-visible" className="font-medium">
                Show Analytics
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Display analytics charts on the dashboard.
              </p>
            </div>
            <Switch id="analytics-visible" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="detailed-users" className="font-medium">
                Detailed User Info
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Show detailed information for users in the dashboard.
              </p>
            </div>
            <Switch id="detailed-users" defaultChecked />
          </div>
          
          <Button onClick={handleSaveSettings}>Save Display Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
