import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      description: "Perfect for trying out AIProjects",
      price: "₹0",
      period: "forever",
      icon: Zap,
      badge: null,
      features: [
        "5 AI-generated projects per month",
        "Basic templates and components",
        "Community support",
        "Standard code quality",
        "Public project hosting"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      description: "For professional developers and freelancers",
      price: "₹2,999",
      period: "per month",
      icon: Crown,
      badge: "Most Popular",
      features: [
        "Unlimited AI-generated projects",
        "Premium templates and components",
        "Priority support (24/7)",
        "Production-ready code",
        "Custom domain hosting",
        "Team collaboration (up to 5 members)",
        "Advanced customization options",
        "API access and integrations"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      description: "For agencies and large teams",
      price: "Custom",
      period: "pricing",
      icon: Rocket,
      badge: "Custom",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "Dedicated account manager",
        "Custom AI model training",
        "White-label solutions",
        "SLA guarantees",
        "On-premise deployment",
        "Advanced security features"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-background-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            Simple, transparent
            <span className="text-gradient"> pricing</span>
          </h2>
          <p className="text-xl text-foreground-secondary">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`glass-card hover-lift border-border/20 relative ${
                plan.popular ? 'border-primary/50 ring-2 ring-primary/20' : ''
              } animate-fade-in`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-primary text-primary-foreground px-4 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8 pt-8">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                  plan.popular ? 'bg-gradient-primary' : 'bg-muted'
                }`}>
                  <plan.icon className={`h-8 w-8 ${
                    plan.popular ? 'text-primary-foreground' : 'text-foreground'
                  }`} />
                </div>
                
                <CardTitle className="text-2xl font-display">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-6">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-foreground-secondary">/{plan.period}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground-secondary leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-primary hover-glow' 
                      : 'bg-secondary hover:bg-secondary-dark'
                  }`}
                  asChild
                >
                  <Link to="/login/user" className="flex items-center justify-center space-x-2">
                    <span>{plan.cta}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                {plan.name === "Free" && (
                  <p className="text-xs text-center text-foreground-secondary">
                    No credit card required
                  </p>
                )}
                
                {plan.name === "Pro" && (
                  <p className="text-xs text-center text-foreground-secondary">
                    14-day free trial • Cancel anytime
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="text-center mt-16">
          <p className="text-foreground-secondary mb-4">
            Have questions about pricing?
          </p>
          <Button variant="ghost" size="lg" className="hover-lift">
            View Pricing FAQ
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;