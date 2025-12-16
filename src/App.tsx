import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { Settings } from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Members */}
          <Route path="/members" element={<MembersList />} />
          <Route path="/members/new" element={<MemberForm />} />
          <Route path="/members/:id" element={<MemberDetail />} />
          <Route path="/members/:id/edit" element={<MemberForm />} />
          
          {/* Groups */}
          <Route path="/groups" element={<GroupsList />} />
          <Route path="/groups/new" element={<GroupForm />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/groups/:id/edit" element={<GroupForm />} />
          
          {/* Occasions */}
          <Route path="/occasions" element={<OccasionsList />} />
          <Route path="/occasions/new" element={<OccasionForm />} />
          <Route path="/occasions/:id" element={<OccasionDetail />} />
          <Route path="/occasions/:id/edit" element={<OccasionForm />} />
          <Route path="/occasions/:id/attendance" element={<AttendanceMarking />} />
          
          {/* Settings */}
          <Route path="/settings" element={<Settings />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
