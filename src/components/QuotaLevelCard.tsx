import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { LevelType } from '@/hooks/useQuotaManagement';

interface QuotaLevelCardProps {
  level: LevelType;
  title: string;
  description: string;
  isLocked: boolean;
  remaining: number | 'unlimited' | 'locked';
  limit: number | 'unlimited' | 'locked';
  onGenerate: (projectType: string, industry: string) => void;
  generating: boolean;
}

const levelColors = {
  beginner: 'from-green-500 to-emerald-500',
  intermediate: 'from-blue-500 to-indigo-500',
  veteran: 'from-purple-500 to-pink-500'
};

export const QuotaLevelCard = ({
  level,
  title,
  description,
  isLocked,
  remaining,
  limit,
  onGenerate,
  generating
}: QuotaLevelCardProps) => {
  const [projectType, setProjectType] = useState('');
  const [industry, setIndustry] = useState('');

  const handleGenerate = () => {
    if (!projectType || !industry) return;
    onGenerate(projectType, industry);
  };

  const getBadgeContent = () => {
    if (isLocked || remaining === 'locked') {
      return <Badge variant="destructive">Locked</Badge>;
    }
    if (remaining === 'unlimited') {
      return <Badge variant="default" className="bg-green-500">Unlimited</Badge>;
    }
    return <Badge variant="secondary">{remaining} left this month</Badge>;
  };

  const canGenerate = !isLocked && remaining !== 'locked' && (remaining === 'unlimited' || (typeof remaining === 'number' && remaining > 0)) && projectType && industry && !generating;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <div className={`glass-card rounded-xl p-6 border-2 ${isLocked ? 'border-muted' : 'border-primary/20'} transition-all hover:shadow-lg`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-xl font-bold bg-gradient-to-r ${levelColors[level]} bg-clip-text text-transparent`}>
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {getBadgeContent()}
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor={`${level}-type`}>Project Type</Label>
            <Select value={projectType} onValueChange={setProjectType} disabled={isLocked || generating}>
              <SelectTrigger id={`${level}-type`}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="mobile-app">Mobile App</SelectItem>
                <SelectItem value="web-app">Web Application</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="landing-page">Landing Page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor={`${level}-industry`}>Industry</Label>
            <Select value={industry} onValueChange={setIndustry} disabled={isLocked || generating}>
              <SelectTrigger id={`${level}-industry`}>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">Restaurant & Food</SelectItem>
                <SelectItem value="fitness">Fitness & Gym</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="gaming">Gaming</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="fintech">Fintech</SelectItem>
                <SelectItem value="real-estate">Real Estate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full bg-gradient-primary"
            size="lg"
          >
            {generating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Zap className="h-4 w-4" />
                </motion.div>
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Brief
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-semibold text-center mb-2">Locked on your plan</p>
            <Button variant="default" size="sm" className="bg-gradient-primary" asChild>
              <Link to="/pricing?upgrade=pro">
                Upgrade to {level === 'veteran' ? 'Pro' : 'Pro+'}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
