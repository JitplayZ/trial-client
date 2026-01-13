import { Link } from 'react-router-dom';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, Book, MessageCircle, Mail, FileQuestion } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const Support = () => {
  const faqs = [
    {
      question: "How do I generate a client brief?",
      answer: "After signing in, go to your Dashboard and click 'Generate New Project'. Choose your difficulty level (Beginner, Intermediate, or Veteran), select an industry and project type, then click Generate. Your AI-powered brief will be ready in seconds."
    },
    {
      question: "What's the difference between difficulty levels?",
      answer: "Beginner briefs are straightforward projects ideal for those new to the field. Intermediate briefs include more complex requirements and constraints. Veteran briefs simulate challenging real-world scenarios with multiple stakeholders and advanced requirements."
    },
    {
      question: "How many briefs can I generate for free?",
      answer: "Free users get unlimited Beginner-level briefs and 2 Intermediate briefs per month. Veteran briefs are available with a Pro subscription. You can also earn additional credits through referrals and social sharing."
    },
    {
      question: "Can I use generated projects in my portfolio?",
      answer: "Absolutely! All generated briefs are meant to be completed and showcased. We encourage you to build out the projects and add them to your portfolio. Just remember to note that it's a practice project."
    },
    {
      question: "How do referral credits work?",
      answer: "Share your unique referral code with friends. When they sign up and generate their first project, both of you receive bonus credits. Check your Dashboard for your referral link."
    },
    {
      question: "What if I find a bug or have a feature request?",
      answer: "We'd love to hear from you! Use the Contact page to report bugs or suggest features. Our team reviews all submissions and prioritizes based on community feedback."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 sm:py-20 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-8 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl sm:text-5xl font-bold text-gradient mb-6">
          Support Center
        </h1>
        
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          Find answers to common questions or get in touch with our team.
        </p>

        {/* Quick Links */}
        <section className="grid gap-4 sm:grid-cols-3 mb-16">
          <Link to="/help" className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
            <Book className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Help Center</h3>
            <p className="text-sm text-muted-foreground">
              Detailed guides and tutorials
            </p>
          </Link>
          
          <Link to="/contact" className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
            <MessageCircle className="h-8 w-8 text-accent mb-4" />
            <h3 className="font-semibold mb-2">Contact Us</h3>
            <p className="text-sm text-muted-foreground">
              Get in touch directly
            </p>
          </Link>
          
          <a href="mailto:support@trial-clients.com" className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
            <Mail className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground">
              support@trial-clients.com
            </p>
          </a>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <FileQuestion className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Help Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="h-6 w-6 text-accent" />
            <h2 className="text-2xl font-semibold">Still Need Help?</h2>
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-hero border border-border">
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is here to help.
              We typically respond within 24-48 hours.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact">
                <Button className="bg-gradient-primary">
                  Contact Support
                </Button>
              </Link>
              <Link to="/help">
                <Button variant="outline">
                  Browse Help Articles
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Support;
