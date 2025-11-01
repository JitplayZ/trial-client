import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminProtectedRoute } from "./components/auth/AdminProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import UserLogin from "./pages/UserLogin";
import AdminLogin from "./pages/AdminLogin";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import History from "./pages/History";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import Notifications from "./pages/Notifications";
import Blog from "./pages/Blog";
import Sitemap from "./pages/Sitemap";
import { ForbiddenPage, ServerErrorPage, MaintenancePage } from "./pages/ErrorPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login/user" element={<UserLogin />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/projects/:id" element={<ProtectedRoute><ProjectWorkspace /></ProtectedRoute>} />
            <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
            <Route path="/account/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/sitemap.xml" element={<Sitemap />} />
            <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="/500" element={<ServerErrorPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
