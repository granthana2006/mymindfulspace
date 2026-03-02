import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import DashboardLayout from "@/components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Planner from "./pages/Planner";
import Books from "./pages/Books";
import Movies from "./pages/Movies";
import College from "./pages/College";
import Finance from "./pages/Finance";
import Fitness from "./pages/Fitness";
import Habits from "./pages/Habits";
import Goals from "./pages/Goals";
import PersonalSpace from "./pages/PersonalSpace";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-float text-4xl">✨</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return <DashboardLayout>{children}</DashboardLayout>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
              <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
              <Route path="/books" element={<ProtectedRoute><Books /></ProtectedRoute>} />
              <Route path="/movies" element={<ProtectedRoute><Movies /></ProtectedRoute>} />
              <Route path="/college" element={<ProtectedRoute><College /></ProtectedRoute>} />
              <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
              <Route path="/fitness" element={<ProtectedRoute><Fitness /></ProtectedRoute>} />
              <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
              <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
              <Route path="/personal" element={<ProtectedRoute><PersonalSpace /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
