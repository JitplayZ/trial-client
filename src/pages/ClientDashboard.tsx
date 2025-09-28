import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/navbar';
import DashboardCards from '@/components/dashboard/DashboardCards';
import RecentProjectsList from '@/components/dashboard/RecentProjectsList';
import QuickActions from '@/components/dashboard/QuickActions';
import GamificationBar from '@/components/dashboard/GamificationBar';

const ClientDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main content */}
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-gradient mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-foreground-secondary">
              Ready to build something amazing today?
            </p>
          </div>

          {/* Gamification Bar */}
          <GamificationBar />

          {/* Quick Action Hero Card */}
          <div className="mb-8">
            <div className="bg-gradient-primary rounded-xl p-8 text-center text-primary-foreground">
              <h2 className="text-2xl font-bold mb-2">Generate Your Next Project</h2>
              <p className="text-primary-foreground/80 mb-4">
                Transform your ideas into reality with AI-powered project generation
              </p>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats and Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              <DashboardCards />
              <QuickActions />
            </div>

            {/* Right Column - Recent Projects */}
            <div className="lg:col-span-2">
              <RecentProjectsList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;