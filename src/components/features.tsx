import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  Shield, 
  Rocket, 
  Code, 
  Palette, 
  Globe,
  Users,
  TrendingUp,
  Clock
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Generation",
      description: "Advanced AI creates full-stack applications, landing pages, and tools in minutes, not weeks."
    },
    {
      icon: Code,
      title: "Production-Ready Code",
      description: "Get clean, maintainable code with modern frameworks, testing, and documentation included."
    },
    {
      icon: Palette,
      title: "Custom Design Systems",
      description: "Beautiful, responsive designs that match your brand and client requirements perfectly."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Built-in authentication, authorization, and security best practices for professional deployment."
    },
    {
      icon: Rocket,
      title: "Instant Deployment",
      description: "One-click deployment to production with CI/CD pipelines and monitoring included."
    },
    {
      icon: Globe,
      title: "Multi-Platform Support",
      description: "Generate web apps, mobile apps, APIs, and integrations that work across all platforms."
    },
    {
      icon: Users,
      title: "Team Collaboration", 
      description: "Share projects, gather feedback, and collaborate with clients and team members seamlessly."
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Built-in analytics, performance monitoring, and user behavior tracking for data-driven decisions."
    },
    {
      icon: Clock,
      title: "Version Control",
      description: "Automatic versioning, rollbacks, and project history to iterate safely and efficiently."
    }
  ];

  return (
    <section id="features" className="relative py-24 bg-gradient-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            Everything you need to
            <span className="text-gradient"> build amazing projects</span>
          </h2>
          <p className="text-xl text-foreground-secondary">
            From concept to deployment, our AI handles the complex technical work so you can focus on what matters most — delivering value to your clients.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="glass-card hover-lift border-border/20 group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:shadow-glow transition-shadow duration-300">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-foreground-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;