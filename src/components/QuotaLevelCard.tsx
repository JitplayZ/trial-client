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
  remaining: number | 'locked';
  limit: number | 'locked';
  creditCost: number;
  availableCredits: number;
  canUseCredits: boolean;
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

  const getBadgeContent = () => {
    if (isLocked || remaining === 'locked') {
      return <Badge variant="destructive">Locked - Requires Paid Plan</Badge>;
    }
    if (typeof remaining === 'number' && remaining > 0) {
      return <Badge variant="secondary">{remaining} free left this month</Badge>;
    }
    if (canUseCredits) {
      return <Badge variant="outline">{creditCost} credits per project</Badge>;
    }
    return <Badge variant="destructive">No quota or credits</Badge>;
  };

  const hasAccess = !isLocked && remaining !== 'locked' && (
    (typeof remaining === 'number' && remaining > 0) || canUseCredits
  );
  const canGenerate = hasAccess && projectType && industry && !generating;

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
          
          {/* Credit Cost Display */}
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium text-primary">
              Cost: {creditCost} credit{creditCost > 1 ? 's' : ''} per project
            </p>
          </div>
          
          <div className="mt-4">
            {getBadgeContent()}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor={`${level}-industry`}>Industry</Label>
              <Select value={industry} onValueChange={(val) => { setIndustry(val); setProjectType(''); }} disabled={isLocked || generating}>
                <SelectTrigger id={`${level}-industry`}>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {level === 'beginner' && (
                    <>
                      <SelectItem value="personal-branding">Personal Branding</SelectItem>
                      <SelectItem value="local-business">Local Business</SelectItem>
                      <SelectItem value="blogging-content">Blogging & Content</SelectItem>
                      <SelectItem value="portfolio-creative">Portfolio & Creative Arts</SelectItem>
                      <SelectItem value="education-tutors">Education (Students / Tutors)</SelectItem>
                      <SelectItem value="restaurant-cafe">Restaurant / Café</SelectItem>
                      <SelectItem value="fitness-wellness">Fitness & Wellness</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="travel-diaries">Travel Diaries</SelectItem>
                      <SelectItem value="event-celebrations">Event & Celebrations</SelectItem>
                    </>
                  )}
                  {level === 'intermediate' && (
                    <>
                      <SelectItem value="ecommerce-retail">E-commerce & Retail</SelectItem>
                      <SelectItem value="healthcare-fitness">Healthcare / Fitness</SelectItem>
                      <SelectItem value="real-estate">Real Estate</SelectItem>
                      <SelectItem value="travel-hospitality">Travel & Hospitality</SelectItem>
                      <SelectItem value="saas-productivity">SAAS / Productivity Tools</SelectItem>
                      <SelectItem value="food-delivery">Food Delivery & Services</SelectItem>
                      <SelectItem value="media-news">Media & News</SelectItem>
                      <SelectItem value="hr-job-platforms">HR & Job Platforms</SelectItem>
                      <SelectItem value="online-course">Online Course / Learning</SelectItem>
                      <SelectItem value="entertainment-streaming">Entertainment & Streaming</SelectItem>
                    </>
                  )}
                  {level === 'veteran' && (
                    <>
                      <SelectItem value="ai-ml">AI & Machine Learning</SelectItem>
                      <SelectItem value="fintech-investment">FinTech & Investment</SelectItem>
                      <SelectItem value="edtech-large">EdTech (Large Scale)</SelectItem>
                      <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="b2b-saas">B2B SaaS</SelectItem>
                      <SelectItem value="automation-workflow">Automation & Workflow Tools</SelectItem>
                      <SelectItem value="social-platforms">Social Platforms</SelectItem>
                      <SelectItem value="healthcare-tech">Healthcare Technology</SelectItem>
                      <SelectItem value="marketplace-ecosystems">Marketplace Ecosystems</SelectItem>
                      <SelectItem value="data-analytics">Data & Analytics Companies</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`${level}-type`}>Project Type</Label>
              <Select value={projectType} onValueChange={setProjectType} disabled={isLocked || generating || !industry}>
                <SelectTrigger id={`${level}-type`}>
                  <SelectValue placeholder={industry ? "Select type" : "Select industry first"} />
                </SelectTrigger>
                <SelectContent>
                  {level === 'beginner' && (
                    <>
                      <SelectItem value="portfolio-website">Portfolio Website</SelectItem>
                      <SelectItem value="landing-page">Landing Page</SelectItem>
                      <SelectItem value="simple-blog">Simple Blog Website</SelectItem>
                      <SelectItem value="product-showcase">Product / Service Showcase Page</SelectItem>
                      <SelectItem value="restaurant-menu">Restaurant Menu Website</SelectItem>
                      <SelectItem value="gallery-showcase">Gallery / Media Showcase</SelectItem>
                      <SelectItem value="contact-form">Contact Form Website</SelectItem>
                      <SelectItem value="personal-bio">Single-page Personal Bio Site</SelectItem>
                      <SelectItem value="event-invitation">Event Invitation / Info Website</SelectItem>
                      <SelectItem value="basic-info">Basic Info Website (Static)</SelectItem>
                    </>
                  )}
                  {level === 'intermediate' && (
                    <>
                      <SelectItem value="ecommerce-shop">E-commerce Website / Shop System</SelectItem>
                      <SelectItem value="booking-system">Booking or Appointment System</SelectItem>
                      <SelectItem value="dashboard-analytics">Dashboard / Analytics Panel</SelectItem>
                      <SelectItem value="blogging-cms">Blogging Platform with CMS</SelectItem>
                      <SelectItem value="food-delivery-app">Food Delivery Web App</SelectItem>
                      <SelectItem value="job-portal">Job Portal / Recruitment System</SelectItem>
                      <SelectItem value="course-platform">Course Platform (Mini LMS)</SelectItem>
                      <SelectItem value="membership-website">Membership Website</SelectItem>
                      <SelectItem value="real-estate-listing">Real Estate Listing Website</SelectItem>
                      <SelectItem value="chat-messaging">Chat / Messaging Web App</SelectItem>
                    </>
                  )}
                  {level === 'veteran' && (
                    <>
                      <SelectItem value="ai-saas-platform">AI SaaS Platform (credit-based)</SelectItem>
                      <SelectItem value="fintech-dashboard">FinTech Dashboard / Portfolio Tracker</SelectItem>
                      <SelectItem value="full-lms">Full LMS (Advanced Learning System)</SelectItem>
                      <SelectItem value="automation-builder">Automation Workflow Builder</SelectItem>
                      <SelectItem value="marketplace-platform">Marketplace Platform (Multi-vendor)</SelectItem>
                      <SelectItem value="social-media-clone">Social Media Platform Clone</SelectItem>
                      <SelectItem value="ai-chatbot">AI Chatbot System</SelectItem>
                      <SelectItem value="enterprise-dashboard">Enterprise Admin Dashboard</SelectItem>
                      <SelectItem value="data-visualization">Data Visualization System</SelectItem>
                      <SelectItem value="project-management">Project Management / Collaboration Tool</SelectItem>
                    </>
                  )}
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
