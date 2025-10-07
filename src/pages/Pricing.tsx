import { Check, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out',
    features: [
      '3 projects per month',
      'Beginner level only',
      'Basic templates',
      'Community support',
      'Email notifications'
    ],
    cta: 'Current Plan',
    highlighted: false
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'For serious creators',
    features: [
      'Unlimited projects',
      'All skill levels',
      'Premium templates',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
      'API access'
    ],
    cta: 'Upgrade to Pro',
    highlighted: true
  },
  {
    name: 'Team',
    price: '$99',
    description: 'For growing teams',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Collaboration tools',
      'Shared workspace',
      'Admin controls',
      'Custom integrations',
      'Dedicated support'
    ],
    cta: 'Contact Sales',
    highlighted: false
  }
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-8 sm:py-20">
      <div className="container mx-auto px-4">
        {/* Close/Back buttons */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2 text-xs sm:text-sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground">
            Choose the plan that's right for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass-card h-full ${
                plan.highlighted 
                  ? 'border-primary shadow-glow scale-105' 
                  : 'border-border/30'
              }`}>
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    className={`w-full mb-6 ${
                      plan.highlighted 
                        ? 'bg-gradient-primary hover:opacity-90' 
                        : ''
                    }`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 text-success mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            All plans include 14-day money-back guarantee • No credit card required for free plan
          </p>
        </div>
      </div>
    </div>
  );
}
