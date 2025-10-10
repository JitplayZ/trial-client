import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Book, MessageCircle, Mail, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const faqs = [
  {
    question: 'How do I generate my first project?',
    answer: 'Click the "Generate Project" button on your dashboard, choose your skill level (Beginner, Intermediate, or Veteran), select a project type and industry, then click "Generate Brief". Your personalized project brief will be ready in seconds!'
  },
  {
    question: 'What are the different skill levels?',
    answer: 'Beginner: Simple projects for learning basics. Intermediate: More complex projects with advanced features. Veteran: Professional-grade projects with full specifications.'
  },
  {
    question: 'Can I edit generated briefs?',
    answer: 'Yes! Each section of your project brief can be edited directly in the workspace. Click the edit icon next to any section to make changes.'
  },
  {
    question: 'How does the gamification system work?',
    answer: 'Earn XP by completing projects, referring friends, and engaging with the platform. Level up to unlock badges and rewards. You can disable gamification in your account settings if preferred.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans. All payments are processed securely through Stripe.'
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes! You can change your plan at any time from the Billing page. Upgrades take effect immediately, and downgrades apply at the next billing cycle.'
  }
];

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const { toast } = useToast();

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Message Sent',
      description: 'We\'ll get back to you within 24 hours.',
    });
    setSupportMessage('');
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <Helmet>
        <title>Help & FAQ - tRIAL - cLIENTS</title>
        <meta name="description" content="Find answers to common questions about tRIAL - cLIENTS. Learn how to generate briefs, manage projects, and get the most from our platform." />
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      </Helmet>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">How can we help?</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to common questions or get in touch
          </p>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card hover-lift cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Book className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-foreground mb-2">Documentation</h3>
              <p className="text-sm text-muted-foreground">
                Complete guides and tutorials
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift cursor-pointer">
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-foreground mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Connect with other users
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-foreground mb-2">Support</h3>
              <p className="text-sm text-muted-foreground">
                Get help from our team
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFaqs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No results found. Try a different search term.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Still need help?</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="mt-2 min-h-[150px]"
                  required
                />
              </div>
              <Button type="submit" className="bg-gradient-primary">
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
