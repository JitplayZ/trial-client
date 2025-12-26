import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap, Scissors, Crown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { LevelType } from '@/hooks/useQuotaManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    { value: 'portfolio-website', label: 'Portfolio Website', tooltip: 'Showcase your work and skills with a professional portfolio' },
    { value: 'landing-page', label: 'Landing Page', tooltip: 'Single-page site to promote a product, service, or event' },
    { value: 'simple-blog', label: 'Simple Blog Website', tooltip: 'Basic blog with posts and categories' },
    { value: 'product-showcase', label: 'Product / Service Showcase', tooltip: 'Highlight a single product or service offering' },
    { value: 'restaurant-menu', label: 'Restaurant Menu Website', tooltip: 'Display menu items, hours, and location' },
    { value: 'gallery-showcase', label: 'Gallery / Media Showcase', tooltip: 'Visual gallery for photos, art, or media' },
    { value: 'contact-form', label: 'Contact Form Website', tooltip: 'Simple site with contact information and form' },
    { value: 'personal-bio', label: 'Single-page Personal Bio', tooltip: 'Personal introduction and biography page' },
    { value: 'event-invitation', label: 'Event Invitation', tooltip: 'Event details, RSVP, and information page' },
    { value: 'basic-info', label: 'Basic Info Website', tooltip: 'Static informational website' },
  ],
  intermediate: [
    { value: 'ecommerce-shop', label: 'E-commerce Shop', tooltip: 'Online store with products, cart, and checkout' },
    { value: 'booking-system', label: 'Booking System', tooltip: 'Appointment or reservation scheduling platform' },
    { value: 'dashboard-analytics', label: 'Dashboard / Analytics', tooltip: 'Data visualization and reporting dashboard' },
    { value: 'blogging-cms', label: 'Blogging Platform with CMS', tooltip: 'Blog with content management system' },
    { value: 'food-delivery-app', label: 'Food Delivery Web App', tooltip: 'Online food ordering and delivery platform' },
    { value: 'job-portal', label: 'Job Portal', tooltip: 'Job listings and recruitment platform' },
    { value: 'course-platform', label: 'Course Platform (Mini LMS)', tooltip: 'Basic learning management system' },
    { value: 'membership-website', label: 'Membership Website', tooltip: 'Members-only content and subscription site' },
    { value: 'real-estate-listing', label: 'Real Estate Listing', tooltip: 'Property listings and search platform' },
    { value: 'chat-messaging', label: 'Chat / Messaging App', tooltip: 'Real-time messaging web application' },
  ],
  veteran: [
    { value: 'ai-saas-platform', label: 'AI SaaS Platform', tooltip: 'Credit-based AI service with user management' },
    { value: 'fintech-dashboard', label: 'FinTech Dashboard', tooltip: 'Financial portfolio tracking and analytics' },
    { value: 'full-lms', label: 'Full LMS', tooltip: 'Advanced learning management system' },
    { value: 'automation-builder', label: 'Automation Workflow Builder', tooltip: 'Visual workflow automation tool' },
    { value: 'marketplace-platform', label: 'Marketplace Platform', tooltip: 'Multi-vendor marketplace ecosystem' },
    { value: 'social-media-clone', label: 'Social Media Platform', tooltip: 'Social networking platform clone' },
    { value: 'ai-chatbot', label: 'AI Chatbot System', tooltip: 'Intelligent conversational AI interface' },
    { value: 'enterprise-dashboard', label: 'Enterprise Admin Dashboard', tooltip: 'Complex admin panel with analytics' },
    { value: 'data-visualization', label: 'Data Visualization System', tooltip: 'Advanced charts and data reporting' },
    { value: 'project-management', label: 'Project Management Tool', tooltip: 'Team collaboration and task management' },
  ],
};

const industries = {
  beginner: [
    { value: 'personal-branding', label: 'Personal Branding', tooltip: 'Individual professionals building their personal brand' },
    { value: 'local-business', label: 'Local Business', tooltip: 'Small businesses serving local communities' },
    { value: 'blogging-content', label: 'Blogging & Content', tooltip: 'Content creators and bloggers' },
    { value: 'portfolio-creative', label: 'Portfolio & Creative Arts', tooltip: 'Artists, designers, and creative professionals' },
    { value: 'education-tutors', label: 'Education (Tutors)', tooltip: 'Students and independent tutors' },
    { value: 'restaurant-cafe', label: 'Restaurant / Café', tooltip: 'Food service and hospitality' },
    { value: 'fitness-wellness', label: 'Fitness & Wellness', tooltip: 'Gyms, trainers, and wellness providers' },
    { value: 'photography', label: 'Photography', tooltip: 'Professional and amateur photographers' },
    { value: 'travel-diaries', label: 'Travel Diaries', tooltip: 'Travel bloggers and adventurers' },
    { value: 'event-celebrations', label: 'Event & Celebrations', tooltip: 'Event planners and celebration services' },
  ],
  intermediate: [
    { value: 'ecommerce-retail', label: 'E-commerce & Retail', tooltip: 'Online retail and shopping businesses' },
    { value: 'healthcare-fitness', label: 'Healthcare / Fitness', tooltip: 'Healthcare providers and fitness businesses' },
    { value: 'real-estate', label: 'Real Estate', tooltip: 'Property sales and management' },
    { value: 'travel-hospitality', label: 'Travel & Hospitality', tooltip: 'Hotels, travel agencies, and tourism' },
    { value: 'saas-productivity', label: 'SaaS / Productivity Tools', tooltip: 'Software as a service products' },
    { value: 'food-delivery', label: 'Food Delivery & Services', tooltip: 'Food ordering and delivery platforms' },
    { value: 'media-news', label: 'Media & News', tooltip: 'News outlets and media companies' },
    { value: 'hr-job-platforms', label: 'HR & Job Platforms', tooltip: 'Human resources and recruitment' },
    { value: 'online-course', label: 'Online Course / Learning', tooltip: 'E-learning and online education' },
    { value: 'entertainment-streaming', label: 'Entertainment & Streaming', tooltip: 'Streaming services and entertainment' },
  ],
  veteran: [
    { value: 'ai-ml', label: 'AI & Machine Learning', tooltip: 'Artificial intelligence and ML companies' },
    { value: 'fintech-investment', label: 'FinTech & Investment', tooltip: 'Financial technology and investment platforms' },
    { value: 'edtech-large', label: 'EdTech (Large Scale)', tooltip: 'Large-scale educational technology' },
    { value: 'cybersecurity', label: 'Cybersecurity', tooltip: 'Security software and services' },
    { value: 'b2b-saas', label: 'B2B SaaS', tooltip: 'Business-to-business software solutions' },
    { value: 'automation-workflow', label: 'Automation & Workflow', tooltip: 'Process automation and workflow tools' },
    { value: 'social-platforms', label: 'Social Platforms', tooltip: 'Social networking and community platforms' },
    { value: 'healthcare-tech', label: 'Healthcare Technology', tooltip: 'Health tech and medical software' },
    { value: 'marketplace-ecosystems', label: 'Marketplace Ecosystems', tooltip: 'Multi-sided marketplace platforms' },
    { value: 'data-analytics', label: 'Data & Analytics', tooltip: 'Data analysis and business intelligence' },
  ],
};

export const QuotaLevelCard = ({
  level,
  title,
  isLocked,
  remaining,
  limit,
  creditCost,
  availableCredits,
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
      className="relative h-full"
    >
      <Card 
        className={`bg-card/50 backdrop-blur-sm border-2 ${config.borderColor} relative h-full flex flex-col ${isLocked ? 'opacity-75' : ''}`}
      >
        <CardHeader className="text-center pb-6 pt-8">
          <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${config.iconBg}`}>
            <Icon className={`h-7 w-7 ${config.iconColor}`} />
          </div>
          
          <CardTitle className="text-xl sm:text-2xl font-display">{title}</CardTitle>
          
          <div className="mt-3">
            <Badge className={`${config.badgeColor} border-0`}>
              {level}
            </Badge>
          </div>

          {/* Quota & Credit Info */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between items-center px-4 py-2 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Free left:</span>
              <span className="font-semibold">
                {remaining === 'locked' ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <span className={remaining > 0 ? 'text-emerald-400' : 'text-muted-foreground'}>
                    {remaining} / {limit}
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center px-4 py-2 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Credit cost:</span>
              <span className="font-semibold text-primary">{creditCost} credit{creditCost > 1 ? 's' : ''}</span>
            </div>
            {remaining !== 'locked' && remaining <= 0 && (
              <div className="flex justify-between items-center px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                <span className="text-muted-foreground">Your credits:</span>
                <span className={`font-semibold ${availableCredits >= creditCost ? 'text-emerald-400' : 'text-destructive'}`}>
                  {availableCredits}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-6 pt-0">
          <div className="space-y-4 flex-1">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Label htmlFor={`${level}-type`} className="text-sm text-muted-foreground">Project Type</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover border border-border z-50">
                    <p className="text-xs max-w-[200px]">Select the type of project you want to generate a brief for</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={projectType} onValueChange={setProjectType} disabled={isLocked || generating}>
                <SelectTrigger id={`${level}-type`} className="bg-muted/50 border-border/30">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {projectTypes[level].map((item) => (
                    <Tooltip key={item.value}>
                      <TooltipTrigger asChild>
                        <SelectItem value={item.value}>{item.label}</SelectItem>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-popover border border-border z-50">
                        <p className="text-xs max-w-[200px]">{item.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Label htmlFor={`${level}-industry`} className="text-sm text-muted-foreground">Industry</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover border border-border z-50">
                    <p className="text-xs max-w-[200px]">Select the industry context for your project</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={industry} onValueChange={setIndustry} disabled={isLocked || generating}>
                <SelectTrigger id={`${level}-industry`} className="bg-muted/50 border-border/30">
                  <SelectValue placeholder="Select industry..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {industries[level].map((item) => (
                    <Tooltip key={item.value}>
                      <TooltipTrigger asChild>
                        <SelectItem value={item.value}>{item.label}</SelectItem>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-popover border border-border z-50">
                        <p className="text-xs max-w-[200px]">{item.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 mt-auto">
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
