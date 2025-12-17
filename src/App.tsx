import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Dashboard } from "./pages/Dashboard";
import { MembersList } from "./pages/MembersList";
import { MemberForm } from "./pages/MemberForm";
import { MemberDetail } from "./pages/MemberDetail";
import { GroupsList } from "./pages/GroupsList";
import { GroupForm } from "./pages/GroupForm";
import { GroupDetail } from "./pages/GroupDetail";
import { OccasionsList } from "./pages/OccasionsList";
import { OccasionForm } from "./pages/OccasionForm";
import { OccasionDetail } from "./pages/OccasionDetail";
import { AttendanceMarking } from "./pages/AttendanceMarking";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { Auth } from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/auth" element={<Auth />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      
      {/* Members */}
      <Route path="/members" element={<ProtectedRoute><MembersList /></ProtectedRoute>} />
      <Route path="/members/new" element={<ProtectedRoute><MemberForm /></ProtectedRoute>} />
      <Route path="/members/:id" element={<ProtectedRoute><MemberDetail /></ProtectedRoute>} />
      <Route path="/members/:id/edit" element={<ProtectedRoute><MemberForm /></ProtectedRoute>} />
      
      {/* Groups */}
      <Route path="/groups" element={<ProtectedRoute><GroupsList /></ProtectedRoute>} />
      <Route path="/groups/new" element={<ProtectedRoute><GroupForm /></ProtectedRoute>} />
      <Route path="/groups/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
      <Route path="/groups/:id/edit" element={<ProtectedRoute><GroupForm /></ProtectedRoute>} />
      
      {/* Occasions */}
      <Route path="/occasions" element={<ProtectedRoute><OccasionsList /></ProtectedRoute>} />
      <Route path="/occasions/new" element={<ProtectedRoute><OccasionForm /></ProtectedRoute>} />
      <Route path="/occasions/:id" element={<ProtectedRoute><OccasionDetail /></ProtectedRoute>} />
      <Route path="/occasions/:id/edit" element={<ProtectedRoute><OccasionForm /></ProtectedRoute>} />
      <Route path="/occasions/:id/attendance" element={<ProtectedRoute><AttendanceMarking /></ProtectedRoute>} />
      
      {/* Analytics */}
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      
      {/* Settings */}
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
