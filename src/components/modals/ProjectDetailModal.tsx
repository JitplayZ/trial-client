import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuotaManagement, LevelType } from '@/hooks/useQuotaManagement';
import { QuotaLevelCard } from '@/components/QuotaLevelCard';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDetailModal = ({ isOpen, onClose }: ProjectDetailModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { quotaData, getQuotaStatus, getResetDate } = useQuotaManagement();
  const [generatingLevel, setGeneratingLevel] = useState<LevelType | null>(null);
  const [quotaExceededLevel, setQuotaExceededLevel] = useState<LevelType | null>(null);

  const handleGenerate = async (level: LevelType, projectType: string, industry: string) => {
    const status = getQuotaStatus(level);
    
    // Check if user has sufficient credits
    if (!status.available) {
      toast({
        title: "Insufficient Credit Balance",
        description: `You don't have enough credits for this level. You need ${status.creditCost} credit${status.creditCost > 1 ? 's' : ''} or free quota remaining.`,
        variant: "destructive",
      });
      setQuotaExceededLevel(level);
      return;
    }

    setGeneratingLevel(level);
    
    try {
      // Quota consumption is handled server-side by the Edge Function
      const { data, error } = await supabase.functions.invoke('generate-project', {
        body: { level, projectType, industry, userId: user?.id }
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.message || 'Generation failed');
      
      toast({
        title: "Generating Your Brief",
        description: "Please wait while we create your personalized project brief...",
      });

      // Navigate immediately to show generating state
      navigate(`/projects/${data.id}`);
      onClose();
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
      setGeneratingLevel(null);
    }
  };

  const beginnerStatus = getQuotaStatus('beginner');
  const intermediateStatus = getQuotaStatus('intermediate');
  const veteranStatus = getQuotaStatus('veteran');
  const resetDate = getResetDate();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div className="absolute inset-0 bg-[rgba(8,10,16,0.75)] backdrop-blur-md" />

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-6xl bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl overflow-y-auto max-h-[90vh]"
            >
              <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface-hover transition-colors">
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>

              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Level</h2>
                <p className="text-muted-foreground">
                  Select your skill level and generate a brief. {resetDate && `Quotas reset: ${resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </p>
                {quotaData && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Current plan: <span className="font-semibold capitalize">{quotaData.plan}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuotaLevelCard
                  level="beginner"
                  title="Beginner"
                  description="Simple projects for learning"
                  isLocked={beginnerStatus.isLocked}
                  remaining={beginnerStatus.remaining}
                  limit={beginnerStatus.limit}
                  creditCost={beginnerStatus.creditCost}
                  availableCredits={quotaData?.credits ?? 0}
                  canUseCredits={beginnerStatus.canUseCredits}
                  onGenerate={(type, industry) => handleGenerate('beginner', type, industry)}
                  generating={generatingLevel === 'beginner'}
                />
                <QuotaLevelCard
                  level="intermediate"
                  title="Intermediate"
                  description="Advanced features & complexity"
                  isLocked={intermediateStatus.isLocked}
                  remaining={intermediateStatus.remaining}
                  limit={intermediateStatus.limit}
                  creditCost={intermediateStatus.creditCost}
                  availableCredits={quotaData?.credits ?? 0}
                  canUseCredits={intermediateStatus.canUseCredits}
                  onGenerate={(type, industry) => handleGenerate('intermediate', type, industry)}
                  generating={generatingLevel === 'intermediate'}
                />
                <QuotaLevelCard
                  level="veteran"
                  title="Veteran"
                  description="Professional-grade specs"
                  isLocked={veteranStatus.isLocked}
                  remaining={veteranStatus.remaining}
                  limit={veteranStatus.limit}
                  creditCost={veteranStatus.creditCost}
                  availableCredits={quotaData?.credits ?? 0}
                  canUseCredits={veteranStatus.canUseCredits}
                  onGenerate={(type, industry) => handleGenerate('veteran', type, industry)}
                  generating={generatingLevel === 'veteran'}
                />
              </div>

              <p className="text-center text-xs text-muted-foreground mt-6">
                Want to change your plan? <Link to="/pricing" className="text-primary hover:underline">View pricing</Link>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={quotaExceededLevel !== null} onOpenChange={() => setQuotaExceededLevel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insufficient Credit Balance</DialogTitle>
            <DialogDescription>
              You have insufficient credit balance for <span className="font-semibold capitalize">{quotaExceededLevel}</span> level briefs.
              {quotaExceededLevel && (
                <span className="block mt-2">
                  Required: {quotaExceededLevel === 'beginner' ? 1 : quotaExceededLevel === 'intermediate' ? 2 : 5} credits
                </span>
              )}
              {resetDate && (
                <span className="block mt-1 text-xs">
                  Free quotas reset on {resetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setQuotaExceededLevel(null)} className="flex-1">Close</Button>
            <Button className="flex-1 bg-gradient-primary" asChild>
              <Link to="/pricing">Get More Credits</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
