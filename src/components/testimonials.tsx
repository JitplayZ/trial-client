import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from "lucide-react";
import student1 from "@/assets/student1.jpg";
import student2 from "@/assets/student2.jpg";
import student3 from "@/assets/student3.jpg";
import student4 from "@/assets/student4.jpg";
import student5 from "@/assets/student5.jpg";
import student6 from "@/assets/student6.jpg";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Arjun Sharma",
      role: "Computer Science Student",
      company: "IIT Delhi",
      image: student1,
      rating: 5,
      content: "tRIAL-cLIENTS helped me practice real-world client scenarios. I can now approach freelance projects with confidence knowing what clients actually need.",
      project: "Practiced 15+ client briefs"
    },
    {
      name: "Priya Patel", 
      role: "Design Student",
      company: "NIFT Mumbai",
      image: student2,
      rating: 5,
      content: "As a design student, understanding client requirements was my biggest challenge. This platform helped me learn how to interpret briefs and deliver what clients want.",
      project: "Portfolio ready in 2 weeks"
    },
    {
      name: "Rahul Gupta",
      role: "Web Development Student", 
      company: "BITS Pilani",
      image: student3,
      rating: 5,
      content: "The realistic client briefs from tRIAL-cLIENTS prepared me for my first internship. I already knew how to handle client communications and project requirements.",
      project: "Landed dream internship"
    },
    {
      name: "Sarah Chen",
      role: "UX Design Student",
      company: "Stanford University",
      image: student4, 
      rating: 5,
      content: "Perfect for building a portfolio with realistic projects. The briefs feel authentic and help you understand what real clients need from designers.",
      project: "Built complete portfolio"
    },
    {
      name: "Vikram Singh",
      role: "Software Engineering Student",
      company: "VIT Vellore",
      image: student5,
      rating: 5,
      content: "This platform bridges the gap between academic projects and real-world work. The client briefs helped me understand business requirements better.",
      project: "Ready for freelancing"
    },
    {
      name: "Ananya Reddy",
      role: "Product Design Student", 
      company: "MIT",
      image: student6,
      rating: 5,
      content: "tRIAL-cLIENTS gave me the confidence to take on real client work. The realistic scenarios prepared me for actual freelance projects.",
      project: "First paid project secured"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            Trusted by
            <span className="text-gradient"> thousands of students</span>
          </h2>
          <p className="text-xl text-foreground-secondary">
            From design students to developers, students worldwide are preparing for real-world work with tRIAL-cLIENTS.
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
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
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
            Join thousands of students preparing for real-world work
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-foreground-secondary">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span>4.9/5 average rating</span>
            </div>
            <div className="w-1 h-1 bg-muted rounded-full"></div>
            <span>1000+ active students</span>
            <div className="w-1 h-1 bg-muted rounded-full"></div>
            <span>50,000+ briefs generated</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
