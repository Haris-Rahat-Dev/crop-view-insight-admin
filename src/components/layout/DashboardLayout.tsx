
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Loader2, LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';

const DashboardSidebar = () => {
  const { signOut } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-dashboard-green-500 flex items-center justify-center text-white font-bold">
            CV
          </div>
          <div className="font-bold text-lg">CropView Insights</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard">
                    <LayoutDashboard size={20} />
                    <span>Overview</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/users">
                    <Users size={20} />
                    <span>Users</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/predictions">
                    <FileText size={20} />
                    <span>Predictions</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard/settings">
                    <Settings size={20} />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
          onClick={signOut}
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

const DashboardLayout: React.FC = () => {
  const { currentUser, isLoading, isAdmin } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect to login page if not authenticated or not an admin
  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <DashboardSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {currentUser.email}
              </span>
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                {currentUser.email?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
