import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Book, MessageCircle, Mail, X, ArrowLeft, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to send a support message.',
        variant: 'destructive',
      });
      return;
    }

    if (!supportMessage.trim()) {
      toast({
        title: 'Message required',
        description: 'Please enter a message.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          user_id: user.id,
          message: supportMessage.trim()
        });

      if (error) throw error;

      toast({
        title: 'Message Sent',
        description: 'We\'ll get back to you within 24 hours.',
      });
      setSupportMessage('');
    } catch (error) {
      console.error('Error sending support message:', error);
      toast({
        title: 'Failed to send message',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
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
    <div className="min-h-screen bg-background py-4 sm:py-8 lg:py-12">
      <Helmet>
        <title>Help & FAQ - tRIAL - cLIENTS</title>
        <meta name="description" content="Find answers to common questions about tRIAL - cLIENTS. Learn how to generate briefs, manage projects, and get the most from our platform." />
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
      </Helmet>
      
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="gap-1.5 text-xs sm:text-sm -ml-2"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">How can we help?</h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8">
            Find answers to common questions or get in touch
          </p>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 glass-card text-sm sm:text-base h-10 sm:h-11"
            />
          </div>
        </motion.div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
          <Card className="glass-card hover-lift cursor-pointer">
            <CardContent className="pt-4 sm:pt-6 text-center">
              <Book className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">Documentation</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Complete guides and tutorials
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift cursor-pointer">
            <CardContent className="pt-4 sm:pt-6 text-center">
              <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">Community</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Connect with other users
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift cursor-pointer">
            <CardContent className="pt-4 sm:pt-6 text-center">
              <Mail className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">Support</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Get help from our team
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="glass-card mb-6 sm:mb-8">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-foreground text-sm sm:text-base py-3 sm:py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-xs sm:text-sm pb-3 sm:pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFaqs.length === 0 && (
              <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm">
                No results found. Try a different search term.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="glass-card">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Still need help?</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <Label htmlFor="message" className="text-sm">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="mt-2 min-h-[120px] sm:min-h-[150px] text-sm"
                  required
                />
              </div>
              <Button type="submit" className="bg-gradient-primary w-full sm:w-auto" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}