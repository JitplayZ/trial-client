import { useState, useMemo } from 'react';
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
import { Progress } from '@/components/ui/progress';

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

interface ProjectType {
  value: string;
  label: string;
  tooltip: string;
  universal: boolean;
  industries?: string[];
}

// ============= BEGINNER PROJECT TYPES (All Universal) =============
const beginnerProjectTypes: ProjectType[] = [
  { value: 'portfolio-website', label: 'Portfolio Website', tooltip: 'Showcase your work and skills with a professional portfolio', universal: true },
  { value: 'landing-page', label: 'Landing Page', tooltip: 'Single-page site to promote a product, service, or event', universal: true },
  { value: 'simple-blog', label: 'Simple Blog Website', tooltip: 'Basic blog with posts and categories', universal: true },
  { value: 'product-showcase', label: 'Product / Service Showcase Page', tooltip: 'Highlight a single product or service offering', universal: true },
  { value: 'restaurant-menu', label: 'Restaurant Menu Website', tooltip: 'Display menu items, hours, and location', universal: true },
  { value: 'gallery-showcase', label: 'Gallery / Media Showcase', tooltip: 'Visual gallery for photos, art, or media', universal: true },
  { value: 'contact-form', label: 'Contact Form Website', tooltip: 'Simple site with contact information and form', universal: true },
  { value: 'personal-bio', label: 'Single-page Personal Bio Site', tooltip: 'Personal introduction and biography page', universal: true },
  { value: 'event-invitation', label: 'Event Invitation / Info Website', tooltip: 'Event details, RSVP, and information page', universal: true },
  { value: 'basic-info', label: 'Basic Info Website (Static)', tooltip: 'Static informational website', universal: true },
];

// ============= INTERMEDIATE PROJECT TYPES =============
const intermediateProjectTypes: ProjectType[] = [
  // Universal types
  { value: 'dashboard-analytics', label: 'Dashboard / Analytics Panel', tooltip: 'Data visualization and reporting dashboard', universal: true },
  { value: 'booking-system', label: 'Booking or Appointment System', tooltip: 'Appointment or reservation scheduling platform', universal: true },
  { value: 'blogging-cms', label: 'Blogging Platform with CMS', tooltip: 'Blog with content management system', universal: true },
  { value: 'membership-website', label: 'Membership Website', tooltip: 'Members-only content and subscription site', universal: true },
  { value: 'chat-messaging', label: 'Chat / Messaging Web App', tooltip: 'Real-time messaging web application', universal: true },
  { value: 'course-platform', label: 'Course Platform (Mini LMS)', tooltip: 'Basic learning management system', universal: true },
  // Industry-specific types
  { value: 'ecommerce-shop', label: 'E-commerce Website / Shop System', tooltip: 'Online store with products, cart, and checkout', universal: false, industries: ['ecommerce-retail', 'media-subscriptions', 'saas-productivity'] },
  { value: 'real-estate-listing', label: 'Real Estate Listing Website', tooltip: 'Property listings and search platform', universal: false, industries: ['real-estate'] },
  { value: 'food-delivery-app', label: 'Food Delivery Web App', tooltip: 'Online food ordering and delivery platform', universal: false, industries: ['food-delivery'] },
  { value: 'job-portal', label: 'Job Portal / Recruitment System', tooltip: 'Job listings and recruitment platform', universal: false, industries: ['hr-job-platforms', 'media-news', 'saas-productivity'] },
  { value: 'travel-booking', label: 'Travel Booking System', tooltip: 'Hotel and travel reservation platform', universal: false, industries: ['travel-hospitality'] },
];

// ============= VETERAN PROJECT TYPES =============
const veteranProjectTypes: ProjectType[] = [
  // Universal (Enterprise-grade)
  { value: 'enterprise-dashboard', label: 'Enterprise Admin Dashboard', tooltip: 'Complex admin panel with analytics', universal: true },
  { value: 'data-visualization', label: 'Data Visualization & Analytics Platform', tooltip: 'Advanced charts and data reporting', universal: true },
  { value: 'automation-builder', label: 'Automation Workflow Builder', tooltip: 'Visual workflow automation tool', universal: true },
  { value: 'subscription-platform', label: 'Subscription / Credit-Based Platform', tooltip: 'Credit-based AI service with user management', universal: true },
  { value: 'api-platform', label: 'API-first Platform / Integration Hub', tooltip: 'API management and integration platform', universal: true },
  { value: 'ai-chatbot', label: 'AI Chatbot / Virtual Assistant System', tooltip: 'Intelligent conversational AI interface', universal: true },
  { value: 'project-management', label: 'Project Management / Collaboration Tool', tooltip: 'Team collaboration and task management', universal: true },
  // Industry-specific
  { value: 'ai-saas-platform', label: 'AI SaaS Platform', tooltip: 'AI-powered software as a service', universal: false, industries: ['ai-ml', 'b2b-saas', 'data-analytics'] },
  { value: 'fintech-dashboard', label: 'FinTech Dashboard / Portfolio Tracker', tooltip: 'Financial portfolio tracking and analytics', universal: false, industries: ['fintech-investment'] },
  { value: 'full-lms', label: 'Full LMS (Enterprise)', tooltip: 'Advanced learning management system', universal: false, industries: ['edtech-large'] },
  { value: 'marketplace-platform', label: 'Marketplace Platform (Multi-vendor)', tooltip: 'Multi-vendor marketplace ecosystem', universal: false, industries: ['marketplace-ecosystems'] },
  { value: 'social-media-platform', label: 'Social Media Platform', tooltip: 'Social networking platform', universal: false, industries: ['social-platforms'] },
  { value: 'cybersecurity-system', label: 'Cybersecurity Monitoring System', tooltip: 'Security monitoring and threat detection', universal: false, industries: ['cybersecurity'] },
];

// ============= INDUSTRIES =============
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
    { value: 'media-subscriptions', label: 'Media Subscriptions', tooltip: 'Subscription-based media services' },
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

// Get all project types for a level
const allProjectTypes = {
  beginner: beginnerProjectTypes,
  intermediate: intermediateProjectTypes,
  veteran: veteranProjectTypes,
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

  // Filter project types based on selected industry
  const availableProjectTypes = useMemo(() => {
    const levelProjectTypes = allProjectTypes[level];
    
    if (!industry) {
      // No industry selected - show only universal types
      return levelProjectTypes.filter(pt => pt.universal);
    }
    
    // Show universal types + industry-specific types that match selected industry
    return levelProjectTypes.filter(pt => {
      if (pt.universal) return true;
      if ('industries' in pt && pt.industries) {
        return pt.industries.includes(industry);
      }
      return false;
    });
  }, [level, industry]);

  // Reset project type when industry changes if current selection is no longer valid
  const handleIndustryChange = (newIndustry: string) => {
    setIndustry(newIndustry);
    // Check if current project type is still valid
    const newAvailableTypes = allProjectTypes[level].filter(pt => {
      if (pt.universal) return true;
      if ('industries' in pt && pt.industries) {
        return pt.industries.includes(newIndustry);
      }
      return false;
    });
    if (!newAvailableTypes.find(pt => pt.value === projectType)) {
      setProjectType('');
    }
  };

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

          {/* Quota Progress Bar */}
          {remaining !== 'locked' && typeof remaining === 'number' && typeof limit === 'number' && limit > 0 && (
            <div className="mt-4 px-2">
              <Progress 
                value={((limit - remaining) / limit) * 100} 
                showLabel 
                label="Free quota used"
                variant={remaining === 0 ? 'warning' : remaining <= 1 ? 'warning' : 'default'}
              />
            </div>
          )}

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
            {/* Industry First - determines available project types */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Label htmlFor={`${level}-industry`} className="text-sm text-muted-foreground">Industry</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover border border-border z-50">
                    <p className="text-xs max-w-[200px]">Select industry first to see available project types</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={industry} onValueChange={handleIndustryChange} disabled={isLocked || generating}>
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

            {/* Project Type - filtered by industry */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Label htmlFor={`${level}-type`} className="text-sm text-muted-foreground">Project Type</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover border border-border z-50">
                    <p className="text-xs max-w-[200px]">
                      {industry ? 'Select from available project types for your industry' : 'Select an industry first'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select 
                value={projectType} 
                onValueChange={setProjectType} 
                disabled={isLocked || generating || !industry}
              >
                <SelectTrigger id={`${level}-type`} className="bg-muted/50 border-border/30">
                  <SelectValue placeholder={industry ? "Select type..." : "Select industry first..."} />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {availableProjectTypes.map((item) => (
                    <Tooltip key={item.value}>
                      <TooltipTrigger asChild>
                        <SelectItem value={item.value}>
                          {item.label}
                          {!item.universal && <span className="ml-1 text-xs text-muted-foreground">(Industry)</span>}
                        </SelectItem>
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