import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Navbar from '@/components/navbar';

const blogPosts = [
  {
    id: 1,
    title: 'How to Create Realistic Client Briefs for Practice Projects',
    excerpt: 'Learn proven strategies for generating authentic client briefs that mirror real-world scenarios. Perfect for designers and developers building their portfolios.',
    category: 'Tutorial',
    date: '2025-01-15',
    readTime: '8 min',
    slug: 'create-realistic-client-briefs',
    keywords: ['client briefs', 'practice projects', 'portfolio']
  },
  {
    id: 2,
    title: 'Top 10 Fake Client Brief Templates for Designers',
    excerpt: 'Explore our curated collection of fake client brief templates across various industries. Build your design portfolio with realistic project scenarios.',
    category: 'Resources',
    date: '2025-01-10',
    readTime: '6 min',
    slug: 'fake-client-brief-templates',
    keywords: ['brief templates', 'design briefs', 'fake clients']
  },
  {
    id: 3,
    title: 'Why Practice Projects Matter for Junior Developers',
    excerpt: 'Discover how practice projects accelerate skill development and boost your chances of landing your first developer job.',
    category: 'Career',
    date: '2025-01-05',
    readTime: '10 min',
    slug: 'practice-projects-for-developers',
    keywords: ['developer practice', 'junior developer', 'coding projects']
  },
  {
    id: 4,
    title: 'AI-Generated Briefs vs Traditional Brief Writing',
    excerpt: 'Compare AI-powered brief generation with traditional methods. Learn when to use each approach for maximum efficiency.',
    category: 'AI',
    date: '2024-12-28',
    readTime: '7 min',
    slug: 'ai-vs-traditional-briefs',
    keywords: ['AI briefs', 'brief generator', 'automation']
  },
  {
    id: 5,
    title: 'Building a Portfolio: Restaurant & Hospitality Projects',
    excerpt: 'Industry-specific guide to creating compelling restaurant, cafe, and hospitality design projects for your portfolio.',
    category: 'Industry Guide',
    date: '2024-12-20',
    readTime: '9 min',
    slug: 'restaurant-portfolio-projects',
    keywords: ['restaurant design', 'hospitality briefs', 'industry projects']
  },
  {
    id: 6,
    title: 'E-commerce Brief Checklist: Essential Requirements',
    excerpt: 'Comprehensive checklist for e-commerce project briefs covering UX, features, payment systems, and technical specs.',
    category: 'Checklist',
    date: '2024-12-15',
    readTime: '5 min',
    slug: 'ecommerce-brief-checklist',
    keywords: ['e-commerce', 'brief checklist', 'online store']
  },
  {
    id: 7,
    title: 'Fitness & Gym App Briefs: Complete Specification Guide',
    excerpt: 'Learn how to structure fitness app briefs with features, user flows, and technical requirements real clients expect.',
    category: 'Industry Guide',
    date: '2024-12-10',
    readTime: '11 min',
    slug: 'fitness-app-briefs-guide',
    keywords: ['fitness app', 'gym projects', 'mobile app briefs']
  },
  {
    id: 8,
    title: 'From Brief to Prototype: Complete Workflow Tutorial',
    excerpt: 'Step-by-step guide taking you from receiving a client brief to delivering a polished prototype using modern tools.',
    category: 'Tutorial',
    date: '2024-12-05',
    readTime: '15 min',
    slug: 'brief-to-prototype-workflow',
    keywords: ['workflow', 'prototyping', 'design process']
  },
  {
    id: 9,
    title: 'Gaming Industry Briefs: What Makes Them Unique',
    excerpt: 'Explore the specific requirements and challenges of gaming industry briefs including community features and monetization.',
    category: 'Industry Guide',
    date: '2024-11-28',
    readTime: '8 min',
    slug: 'gaming-industry-briefs',
    keywords: ['gaming projects', 'game design', 'gaming briefs']
  },
  {
    id: 10,
    title: 'Beginner vs Intermediate vs Veteran Briefs Explained',
    excerpt: 'Understand the complexity levels in project briefs and choose the right difficulty for your skill level.',
    category: 'Guide',
    date: '2024-11-20',
    readTime: '6 min',
    slug: 'brief-difficulty-levels',
    keywords: ['skill levels', 'beginner projects', 'veteran briefs']
  },
  {
    id: 11,
    title: 'Legal Tech & Fintech Brief Writing Best Practices',
    excerpt: 'Navigate the unique compliance and security requirements when creating briefs for legal and financial technology projects.',
    category: 'Industry Guide',
    date: '2024-11-15',
    readTime: '10 min',
    slug: 'legal-fintech-briefs',
    keywords: ['fintech', 'legal tech', 'compliance briefs']
  },
  {
    id: 12,
    title: 'Maximizing Your Practice Project Portfolio ROI',
    excerpt: 'Strategic approaches to selecting and presenting practice projects that convert into real client work and job offers.',
    category: 'Career',
    date: '2024-11-10',
    readTime: '12 min',
    slug: 'portfolio-roi-strategy',
    keywords: ['portfolio strategy', 'client work', 'career growth']
  }
];

export default function Blog() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              tRIAL - cLIENTS <span className="text-gradient">Blog</span>
            </h1>
            <p className="text-xl text-foreground-secondary max-w-2xl mx-auto">
              Guides, tutorials, and insights on creating realistic client briefs and building practice projects
            </p>
          </motion.div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover-lift flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary">{post.category}</Badge>
                      <div className="flex items-center text-xs text-muted-foreground gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.keywords.slice(0, 3).map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-[10px]">
                          <Tag className="h-2 w-2 mr-1" />
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full group" asChild>
                      <Link to={`/blog/${post.slug}`}>
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <Card className="bg-gradient-hero border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Ready to Generate Your First Brief?</h2>
                <p className="text-foreground-secondary mb-6 max-w-2xl mx-auto">
                  Stop reading and start building. Create realistic client briefs in seconds with our AI-powered platform.
                </p>
                <Button size="lg" className="bg-gradient-primary hover-glow" asChild>
                  <Link to="/login/user">
                    Get Started Free
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}
