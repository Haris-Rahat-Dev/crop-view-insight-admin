
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import ExpertLogin from "./pages/ExpertLogin";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Predictions from "./pages/Predictions";
import Settings from "./pages/Settings";
import DashboardNotFound from "./pages/DashboardNotFound";

// Expert Pages
import ExpertDashboard from "./pages/expert/ExpertDashboard";
import ExpertPredictions from "./pages/expert/ExpertPredictions";
import ExpertNotFound from "./pages/expert/ExpertNotFound";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";
import ExpertLayout from "./components/layout/ExpertLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/expert-login" element={<ExpertLogin />} />
            
            {/* Admin Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="predictions" element={<Predictions />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<DashboardNotFound />} />
            </Route>

            {/* Expert Dashboard Routes */}
            <Route path="/expert" element={<ExpertLayout />}>
              <Route index element={<ExpertDashboard />} />
              <Route path="predictions" element={<ExpertPredictions />} />
              <Route path="*" element={<ExpertNotFound />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
