import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Arjun Sharma",
      role: "Freelance Developer",
      company: "Independent",
      image: "/api/placeholder/64/64",
      rating: 5,
      content: "AIProjects transformed my freelance business. I can now deliver complex projects to clients in days instead of months. The code quality is exceptional!",
      project: "Built 8 client projects in 2 months"
    },
    {
      name: "Priya Patel", 
      role: "Startup Founder",
      company: "TechStart",
      image: "/api/placeholder/64/64",
      rating: 5,
      content: "We needed an MVP fast for our investors. AIProjects generated a full-stack SaaS platform that impressed everyone. Saved us $50k in development costs.",
      project: "MVP delivered in 1 week"
    },
    {
      name: "Rahul Gupta",
      role: "Digital Agency Owner", 
      company: "WebWorks Agency",
      image: "/api/placeholder/64/64",
      rating: 5,
      content: "Our agency uses AIProjects for rapid prototyping and client demos. The quality is professional-grade and clients love the quick turnaround.",
      project: "150+ projects delivered"
    },
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "GrowthCorp",
      image: "/api/placeholder/64/64", 
      rating: 5,
      content: "Perfect for validating ideas quickly. We generated 5 different landing pages to test our product positioning. A/B testing made easy!",
      project: "5x faster iteration"
    },
    {
      name: "Vikram Singh",
      role: "Full-Stack Developer",
      company: "CodeCraft Solutions",
      image: "/api/placeholder/64/64",
      rating: 5,
      content: "The generated code follows best practices and is actually maintainable. I use it as a starting point and customize from there. Huge time saver.",
      project: "80% faster development"
    },
    {
      name: "Ananya Reddy",
      role: "UX Designer", 
      company: "DesignLab",
      image: "/api/placeholder/64/64",
      rating: 5,
      content: "Love how it generates both functional prototypes AND beautiful designs. Clients can see their ideas come to life immediately in our meetings.",
      project: "Doubled client satisfaction"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            Trusted by
            <span className="text-gradient"> thousands of developers</span>
          </h2>
          <p className="text-xl text-foreground-secondary">
            From freelancers to agencies, developers worldwide are building better projects faster with AIProjects.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="glass-card hover-lift border-border/20 group animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-8">
                {/* Quote icon */}
                <div className="mb-6">
                  <Quote className="h-8 w-8 text-primary/20" />
                </div>

                {/* Content */}
                <blockquote className="text-foreground-secondary leading-relaxed mb-6">
                  "{testimonial.content}"
                </blockquote>

                {/* Project highlight */}
                <div className="mb-6">
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                    {testimonial.project}
                  </Badge>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-foreground-secondary">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-foreground-secondary mb-6">
            Join thousands of developers building with AI
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-foreground-secondary">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span>4.9/5 average rating</span>
            </div>
            <div className="w-1 h-1 bg-muted rounded-full"></div>
            <span>1000+ active developers</span>
            <div className="w-1 h-1 bg-muted rounded-full"></div>
            <span>50,000+ projects generated</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;