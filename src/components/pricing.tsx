import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      description: "Perfect for trying out",
      price: "$0",
      period: "month",
      icon: Zap,
      badge: null,
      features: [
        "3 project generation/month (Beginner Level)",
        "2 project generation/month (Intermediate Level)",
        "Email Support",
        "5 free joining credits (One Time Only)"
      ],
      cta: "Get Started Free",
      ctaLink: "/auth",
      popular: false,
      isContact: false
    },
    {
      name: "Pro",
      description: "For serious ones",
      price: "$5",
      period: "month",
      icon: Crown,
      badge: "Most Popular",
      features: [
        "Access all project levels",
        "15 credits per month",
        "Priority Support",
        "Everything in Free"
      ],
      cta: "Upgrade to Pro",
      ctaLink: "/auth",
      popular: true,
      isContact: false
    },
    {
      name: "Contact",
      description: "For Professionals",
      price: "Custom",
      period: "pricing",
      icon: Mail,
      badge: null,
      features: [
        "Unlimited project generations",
        "Custom credit packages",
        "Dedicated account manager",
        "Custom integrations",
        "White-label solutions",
        "SLA guarantees"
      ],
      cta: "Contact Us",
      ctaLink: "mailto:help.trialclients@gmail.com",
      popular: false,
      isContact: true
    }
  ];

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4 sm:mb-6">
            Simple, transparent
            <span className="text-gradient"> pricing</span>
          </h2>
          <p className="text-lg sm:text-xl text-foreground-secondary">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`glass-card hover-lift border-border/20 relative flex flex-col ${
                plan.popular ? 'border-primary/50 ring-2 ring-primary/20 scale-[1.02]' : ''
              } animate-fade-in`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-primary text-primary-foreground px-4 py-1 text-xs font-semibold">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6 pt-8">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                  plan.popular ? 'bg-gradient-primary' : 'bg-muted'
                }`}>
                  <plan.icon className={`h-7 w-7 ${
                    plan.popular ? 'text-primary-foreground' : 'text-foreground'
                  }`} />
                </div>
                
                <CardTitle className="text-xl sm:text-2xl font-display">{plan.name}</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                    <span className="text-foreground-secondary text-sm">/{plan.period}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col space-y-6">
                {/* Features */}
                <ul className="space-y-3 flex-1">
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
                {plan.isContact ? (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <a href={plan.ctaLink} className="flex items-center justify-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{plan.cta}</span>
                    </a>
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-primary hover-glow' 
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    asChild
                  >
                    <Link to={plan.ctaLink} className="flex items-center justify-center space-x-2">
                      <span>{plan.cta}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}

                {plan.name === "Free" && (
                  <p className="text-xs text-center text-foreground-secondary">
                    No credit card required
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;