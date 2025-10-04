import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LevelCardProps {
  level: 'beginner' | 'intermediate' | 'veteran';
  color: string;
  estimatedTime: string;
  onGenerate: (projectType: string, industry: string) => void;
  isLoading: boolean;
}

const LevelCard = ({ level, color, estimatedTime, onGenerate, isLoading }: LevelCardProps) => {
  const [projectType, setProjectType] = useState('');
  const [industry, setIndustry] = useState('');

  const projectTypes = [
    'Website', 'Web App', 'Mobile App', 'Graphic Design', 
    'UI/UX', 'Landing Page', 'E-commerce', 'API', 'Dashboard'
  ];

  const industries = [
    'Fashion', 'Gaming', 'Restaurant', 'Gym', 'Education',
    'SaaS', 'Healthcare', 'Finance', 'Travel', 'Real Estate'
  ];

  const handleGenerate = () => {
    if (!projectType || !industry) {
      return;
    }
    onGenerate(projectType, industry);
  };

  const isValid = projectType && industry;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -6 }}
      whileTap={{ scale: 0.98 }}
      className={`relative glass-card p-6 ${color} group transition-all duration-300`}
      style={{
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}
    >
      {/* Glitch effect overlay */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold capitalize text-foreground">{level}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            level === 'beginner' ? 'bg-success/20 text-success' :
            level === 'intermediate' ? 'bg-warning/20 text-warning' :
            'bg-destructive/20 text-destructive'
          }`}>
            {level}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor={`${level}-type`} className="text-sm text-muted-foreground mb-2">
              Project Type
            </Label>
            <Select value={projectType} onValueChange={setProjectType} disabled={isLoading}>
              <SelectTrigger id={`${level}-type`} className="bg-background/50 backdrop-blur-sm">
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
            <Label htmlFor={`${level}-industry`} className="text-sm text-muted-foreground mb-2">
              Industry
            </Label>
            <Select value={industry} onValueChange={setIndustry} disabled={isLoading}>
              <SelectTrigger id={`${level}-industry`} className="bg-background/50 backdrop-blur-sm">
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGenerate = async (level: string, projectType: string, industry: string) => {
    setIsLoading(true);
    
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
    } finally {
      setIsLoading(false);
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
          {/* Backdrop blur */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-6xl glass-card p-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">Choose Your Level</h2>
              <p className="text-muted-foreground">Pick a skill level — Try Beginner first!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <LevelCard
                level="beginner"
                color="border-l-4 border-success"
                estimatedTime="5-10 minutes"
                onGenerate={(type, industry) => handleGenerate('beginner', type, industry)}
                isLoading={isLoading}
              />
              <LevelCard
                level="intermediate"
                color="border-l-4 border-warning"
                estimatedTime="10-20 minutes"
                onGenerate={(type, industry) => handleGenerate('intermediate', type, industry)}
                isLoading={isLoading}
              />
              <LevelCard
                level="veteran"
                color="border-l-4 border-destructive"
                estimatedTime="20-30 minutes"
                onGenerate={(type, industry) => handleGenerate('veteran', type, industry)}
                isLoading={isLoading}
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
