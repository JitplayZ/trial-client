import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Share2 } from 'lucide-react';
import { ProjectDetailModal } from '@/components/modals/ProjectDetailModal';
import { ReferralModal } from '@/components/modals/ReferralModal';

const QuickActions = () => {
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const handleGenerateProject = () => {
    setProjectModalOpen(true);
  };

  const actions = [
    {
      title: 'Generate Project',
      description: 'Create a new AI-powered project',
      icon: Zap,
      onClick: handleGenerateProject,
      variant: 'default' as const
    },
    {
      title: 'Refer People',
      description: 'Refer karo — pao extra free projects',
      icon: Share2,
      onClick: () => setReferralModalOpen(true),
      variant: 'outline' as const
    }
  ];

  return (
    <>
      <Card className="bg-card/50 backdrop-blur-sm border-border/30">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant}
                  size="lg"
                  onClick={action.onClick}
                  className={`h-auto p-6 flex flex-col items-center justify-center space-y-3 min-h-[120px] ${
                    action.variant === 'default' ? 'bg-gradient-primary hover-glow' : 'hover-lift'
                  }`}
                >
                  <Icon className="h-8 w-8 flex-shrink-0" />
                  <div className="text-center w-full">
                    <div className="font-semibold text-base line-clamp-1">{action.title}</div>
                    <div className="text-sm opacity-80 line-clamp-2 mt-1">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Referral Modal */}
      <ReferralModal 
        isOpen={referralModalOpen} 
        onClose={() => setReferralModalOpen(false)} 
      />

      {/* Project Detail Modal */}
      <ProjectDetailModal 
        isOpen={projectModalOpen} 
        onClose={() => setProjectModalOpen(false)} 
      />
    </>
  );
};

export default QuickActions;