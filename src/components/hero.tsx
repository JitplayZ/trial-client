import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-surface/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-border/20 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground-secondary">
              AI-Powered Project Generation
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6 animate-slide-up">
            Build Real Client
            <br />
            <span className="text-gradient">Projects with AI</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-foreground-secondary max-w-2xl mx-auto mb-12 animate-fade-in delay-200">
            Transform your ideas into professional projects that impress clients and build your portfolio. Start free — get real results.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-bounce-in delay-400">
            <Button
              size="lg"
              className="bg-gradient-primary hover-glow text-lg px-8 py-4 h-auto"
              asChild
            >
              <Link to="/login/user" className="flex items-center space-x-3">
                <Zap className="h-5 w-5" />
                <span>Start Free — Build Projects</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="text-lg px-8 py-4 h-auto hover-lift"
            >
              <Play className="h-5 w-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Social proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-foreground-secondary animate-fade-in delay-600">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="w-8 h-8 bg-gradient-primary rounded-full border-2 border-background"
                  ></div>
                ))}
              </div>
              <span>1000+ developers building</span>
            </div>
            <div className="w-1 h-1 bg-muted rounded-full hidden sm:block"></div>
            <span>⭐ 4.9/5 rating</span>
            <div className="w-1 h-1 bg-muted rounded-full hidden sm:block"></div>
            <span>🚀 Free tier available</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;