import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap, Scissors, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { LevelType } from '@/hooks/useQuotaManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuotaLevelCardProps {
  level: LevelType;
  title: string;
  description: string;
  isLocked: boolean;
  remaining: number | 'locked';
  limit: number | 'locked';
  creditCost: number;
  availableCredits: number;
  canUseCredits: boolean;
  onGenerate: (projectType: string, industry: string) => void;
  generating: boolean;
}

const levelConfig = {
  beginner: {
    icon: Zap,
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    badgeColor: 'bg-emerald-500/20 text-emerald-400',
  },
  intermediate: {
    icon: Scissors,
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    badgeColor: 'bg-orange-500/20 text-orange-400',
  },
  veteran: {
    icon: Crown,
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    badgeColor: 'bg-red-500/20 text-red-400',
  }
};

const projectTypes = {
  beginner: [
    { value: 'portfolio-website', label: 'Portfolio Website' },
    { value: 'landing-page', label: 'Landing Page' },
    { value: 'simple-blog', label: 'Simple Blog Website' },
    { value: 'product-showcase', label: 'Product / Service Showcase Page' },
    { value: 'restaurant-menu', label: 'Restaurant Menu Website' },
    { value: 'gallery-showcase', label: 'Gallery / Media Showcase' },
    { value: 'contact-form', label: 'Contact Form Website' },
    { value: 'personal-bio', label: 'Single-page Personal Bio Site' },
    { value: 'event-invitation', label: 'Event Invitation / Info Website' },
    { value: 'basic-info', label: 'Basic Info Website (Static)' },
  ],
  intermediate: [
    { value: 'ecommerce-shop', label: 'E-commerce Website / Shop System' },
    { value: 'booking-system', label: 'Booking or Appointment System' },
    { value: 'dashboard-analytics', label: 'Dashboard / Analytics Panel' },
    { value: 'blogging-cms', label: 'Blogging Platform with CMS' },
    { value: 'food-delivery-app', label: 'Food Delivery Web App' },
    { value: 'job-portal', label: 'Job Portal / Recruitment System' },
    { value: 'course-platform', label: 'Course Platform (Mini LMS)' },
    { value: 'membership-website', label: 'Membership Website' },
    { value: 'real-estate-listing', label: 'Real Estate Listing Website' },
    { value: 'chat-messaging', label: 'Chat / Messaging Web App' },
  ],
  veteran: [
    { value: 'ai-saas-platform', label: 'AI SaaS Platform (credit-based)' },
    { value: 'fintech-dashboard', label: 'FinTech Dashboard / Portfolio Tracker' },
    { value: 'full-lms', label: 'Full LMS (Advanced Learning System)' },
    { value: 'automation-builder', label: 'Automation Workflow Builder' },
    { value: 'marketplace-platform', label: 'Marketplace Platform (Multi-vendor)' },
    { value: 'social-media-clone', label: 'Social Media Platform Clone' },
    { value: 'ai-chatbot', label: 'AI Chatbot System' },
    { value: 'enterprise-dashboard', label: 'Enterprise Admin Dashboard' },
    { value: 'data-visualization', label: 'Data Visualization System' },
    { value: 'project-management', label: 'Project Management / Collaboration Tool' },
  ],
};

const industries = {
  beginner: [
    { value: 'personal-branding', label: 'Personal Branding' },
    { value: 'local-business', label: 'Local Business' },
    { value: 'blogging-content', label: 'Blogging & Content' },
    { value: 'portfolio-creative', label: 'Portfolio & Creative Arts' },
    { value: 'education-tutors', label: 'Education (Students / Tutors)' },
    { value: 'restaurant-cafe', label: 'Restaurant / Café' },
    { value: 'fitness-wellness', label: 'Fitness & Wellness' },
    { value: 'photography', label: 'Photography' },
    { value: 'travel-diaries', label: 'Travel Diaries' },
    { value: 'event-celebrations', label: 'Event & Celebrations' },
  ],
  intermediate: [
    { value: 'ecommerce-retail', label: 'E-commerce & Retail' },
    { value: 'healthcare-fitness', label: 'Healthcare / Fitness' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'travel-hospitality', label: 'Travel & Hospitality' },
    { value: 'saas-productivity', label: 'SAAS / Productivity Tools' },
    { value: 'food-delivery', label: 'Food Delivery & Services' },
    { value: 'media-news', label: 'Media & News' },
    { value: 'hr-job-platforms', label: 'HR & Job Platforms' },
    { value: 'online-course', label: 'Online Course / Learning' },
    { value: 'entertainment-streaming', label: 'Entertainment & Streaming' },
  ],
  veteran: [
    { value: 'ai-ml', label: 'AI & Machine Learning' },
    { value: 'fintech-investment', label: 'FinTech & Investment' },
    { value: 'edtech-large', label: 'EdTech (Large Scale)' },
    { value: 'cybersecurity', label: 'Cybersecurity' },
    { value: 'b2b-saas', label: 'B2B SaaS' },
    { value: 'automation-workflow', label: 'Automation & Workflow Tools' },
    { value: 'social-platforms', label: 'Social Platforms' },
    { value: 'healthcare-tech', label: 'Healthcare Technology' },
    { value: 'marketplace-ecosystems', label: 'Marketplace Ecosystems' },
    { value: 'data-analytics', label: 'Data & Analytics Companies' },
  ],
};

export const QuotaLevelCard = ({
  level,
  title,
  isLocked,
  remaining,
  canUseCredits,
  onGenerate,
  generating
}: QuotaLevelCardProps) => {
  const [projectType, setProjectType] = useState('');
  const [industry, setIndustry] = useState('');

  const handleGenerate = () => {
    if (!projectType || !industry) return;
    onGenerate(projectType, industry);
  };

  const hasAccess = !isLocked && remaining !== 'locked' && (
    (typeof remaining === 'number' && remaining > 0) || canUseCredits
  );
  const canGenerateNow = hasAccess && projectType && industry && !generating;

  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <Card 
        className={`bg-card/50 backdrop-blur-sm border-2 ${config.borderColor} relative ${isLocked ? 'opacity-75' : ''}`}
      >
        <CardHeader className="text-center pb-4 pt-6">
          <div className={`w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center ${config.iconBg}`}>
            <Icon className={`h-7 w-7 ${config.iconColor}`} />
          </div>
          
          <CardTitle className="text-xl font-display">{title}</CardTitle>
          
          <div className="mt-2">
            <Badge className={`${config.badgeColor} border-0`}>
              {level}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <div className="space-y-3">
            <div>
              <Label htmlFor={`${level}-type`} className="text-sm text-muted-foreground">Project Type</Label>
              <Select value={projectType} onValueChange={setProjectType} disabled={isLocked || generating}>
                <SelectTrigger id={`${level}-type`} className="bg-muted/50 border-border/30">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes[level].map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`${level}-industry`} className="text-sm text-muted-foreground">Industry</Label>
              <Select value={industry} onValueChange={setIndustry} disabled={isLocked || generating}>
                <SelectTrigger id={`${level}-industry`} className="bg-muted/50 border-border/30">
                  <SelectValue placeholder="Select industry..." />
                </SelectTrigger>
                <SelectContent>
                  {industries[level].map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Estimated time: {level === 'beginner' ? '5-10' : level === 'intermediate' ? '10-20' : '20-30'} minutes
            </p>

            <Button 
              onClick={handleGenerate}
              disabled={!canGenerateNow}
              className="w-full bg-primary hover:bg-primary/90"
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
                'Generate Brief'
              )}
            </Button>
          </div>
        </CardContent>

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-semibold text-center mb-2">Locked on your plan</p>
            <Button variant="default" size="sm" className="bg-primary" asChild>
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
