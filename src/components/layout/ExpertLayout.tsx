
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Loader2, LayoutDashboard, FileText, LogOut } from 'lucide-react';

const ExpertSidebar = () => {
  const { signOut } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            CV
          </div>
          <div className="font-bold text-lg">CropView Expert</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Expert Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/expert">
                    <LayoutDashboard size={20} />
                    <span>Overview</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/expert/predictions">
                    <FileText size={20} />
                    <span>Review Predictions</span>
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

const ExpertLayout: React.FC = () => {
  const { currentUser, isLoading, isExpert } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect to expert login page if not authenticated or not an expert
  if (!currentUser || !isExpert) {
    return <Navigate to="/expert-login" replace />;
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <ExpertSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {currentUser.email}
              </span>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                {currentUser.email?.[0]?.toUpperCase() || 'E'}
              </div>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ExpertLayout;
