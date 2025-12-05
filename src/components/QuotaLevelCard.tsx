import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { LevelType } from '@/hooks/useQuotaManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

const levelIcons = {
  beginner: Zap,
  intermediate: Zap,
  veteran: Zap
};

const levelBadges = {
  beginner: null,
  intermediate: "Popular",
  veteran: "Pro"
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

  const Icon = levelIcons[level];
  const badge = levelBadges[level];
  const isPopular = level === 'intermediate';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <Card 
        className={`glass-card hover-lift border-border/20 relative ${
          isPopular ? 'border-primary/50 ring-2 ring-primary/20' : ''
        } ${isLocked ? 'opacity-75' : ''}`}
      >
        {badge && !isLocked && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-primary text-primary-foreground px-4 py-1">
              {badge}
            </Badge>
          </div>
        )}
        
        <CardHeader className="text-center pb-8 pt-8">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
            isPopular ? 'bg-gradient-primary' : 'bg-muted'
          }`}>
            <Icon className={`h-8 w-8 ${
              isPopular ? 'text-primary-foreground' : 'text-foreground'
            }`} />
          </div>
          
          <CardTitle className="text-2xl font-display">{title}</CardTitle>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
          
          <div className="mt-6">
            {getBadgeContent()}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
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
              className={`w-full ${
                isPopular 
                  ? 'bg-gradient-primary hover-glow' 
                  : 'bg-secondary hover:bg-secondary-dark'
              }`}
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

          {/* Features List */}
          <ul className="space-y-3 pt-4 border-t border-border/20">
            <li className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground-secondary leading-relaxed">
                {level === 'beginner' && 'Basic project templates'}
                {level === 'intermediate' && 'Advanced project templates'}
                {level === 'veteran' && 'Professional-grade templates'}
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground-secondary leading-relaxed">
                {level === 'beginner' && 'Simple client scenarios'}
                {level === 'intermediate' && 'Complex client requirements'}
                {level === 'veteran' && 'Enterprise-level projects'}
              </span>
            </li>
          </ul>
        </CardContent>

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
      </Card>
    </motion.div>
  );
};
