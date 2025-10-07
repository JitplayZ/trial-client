import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Rocket, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LevelCardProps {
  level: 'beginner' | 'intermediate' | 'veteran';
  estimatedTime: string;
  onGenerate: (projectType: string, industry: string) => void;
}

const LevelCard = ({ level, estimatedTime, onGenerate }: LevelCardProps) => {
  const [projectType, setProjectType] = useState('');
  const [industry, setIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const projectTypes = [
    'Website', 'Web App', 'Mobile App', 'Graphic Design', 
    'UI/UX', 'Landing Page', 'E-commerce', 'API', 'Dashboard'
  ];

  const industries = [
    'Fashion', 'Gaming', 'Restaurant', 'Gym', 'Education',
    'SaaS', 'Healthcare', 'Finance', 'Travel', 'Real Estate'
  ];

  const handleGenerate = async () => {
    if (!projectType || !industry) {
      return;
    }
    setIsLoading(true);
    try {
      await onGenerate(projectType, industry);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = projectType && industry;

  const levelConfig = {
    beginner: {
      icon: Zap,
      accent: 'from-success/20 to-success/5',
      border: 'border-success/30',
      badge: 'bg-success/20 text-success',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]'
    },
    intermediate: {
      icon: Rocket,
      accent: 'from-warning/20 to-warning/5',
      border: 'border-warning/30',
      badge: 'bg-warning/20 text-warning',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]'
    },
    veteran: {
      icon: Crown,
      accent: 'from-destructive/20 to-destructive/5',
      border: 'border-destructive/30',
      badge: 'bg-destructive/20 text-destructive',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]'
    }
  };

  const config = levelConfig[level];
  const LevelIcon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -6 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-6 rounded-2xl bg-card/40 backdrop-blur-xl border ${config.border} group transition-all duration-300 ${config.glow} hover:shadow-[${config.glow.match(/rgba\([^)]+\)/)?.[0].replace('0.15', '0.35')}]`}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${config.accent} opacity-10`} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.badge}`}>
              <LevelIcon className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold capitalize text-foreground">{level}</h3>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.badge}`}>
            {level}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor={`${level}-type`} className="text-sm text-foreground/80 mb-2 font-medium">
              Project Type
            </Label>
            <Select value={projectType} onValueChange={setProjectType} disabled={isLoading}>
              <SelectTrigger id={`${level}-type`} className="bg-surface/50 backdrop-blur-sm border-border/50 focus:ring-2 focus:ring-primary/20 hover:bg-surface-hover">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`${level}-industry`} className="text-sm text-foreground/80 mb-2 font-medium">
              Industry
            </Label>
            <Select value={industry} onValueChange={setIndustry} disabled={isLoading}>
              <SelectTrigger id={`${level}-industry`} className="bg-surface/50 backdrop-blur-sm border-border/50 focus:ring-2 focus:ring-primary/20 hover:bg-surface-hover">
                <SelectValue placeholder="Select industry..." />
              </SelectTrigger>
              <SelectContent>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 text-xs text-muted-foreground">
            <p>Estimated time: {estimatedTime}</p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!isValid || isLoading}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            size="lg"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                Generating...
              </>
            ) : (
              'Generate Brief'
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDetailModal = ({ isOpen, onClose }: ProjectDetailModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGenerate = async (level: string, projectType: string, industry: string) => {
    console.info(`[generate] level=${level} projectType=${projectType} industry=${industry}`);
    
    try {
      // Mock API call - replace with actual webhook/API
      const response = await fetch('/api/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          projectType,
          industry,
          userId: user?.id,
          meta: { source: 'web-ui', timestamp: new Date().toISOString() }
        })
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      
      // Show success with confetti effect
      toast({
        title: "Project Brief Generated!",
        description: `Your ${level} ${projectType} project is ready.`,
      });

      // Navigate to project workspace
      setTimeout(() => {
        navigate(`/projects/${data.id}`);
        onClose();
      }, 500);

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop blur - dark translucent (no white) */}
          <div className="absolute inset-0 bg-[rgba(8,10,16,0.75)] backdrop-blur-md" />

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-6xl bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-surface-hover transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>

            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Level</h2>
              <p className="text-muted-foreground">Pick a skill level — Try Beginner first!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <LevelCard
                level="beginner"
                estimatedTime="5-10 minutes"
                onGenerate={(type, industry) => handleGenerate('beginner', type, industry)}
              />
              <LevelCard
                level="intermediate"
                estimatedTime="10-20 minutes"
                onGenerate={(type, industry) => handleGenerate('intermediate', type, industry)}
              />
              <LevelCard
                level="veteran"
                estimatedTime="20-30 minutes"
                onGenerate={(type, industry) => handleGenerate('veteran', type, industry)}
              />
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Generating brief — this may take a few seconds...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
