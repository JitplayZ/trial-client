import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Download, Share2, Edit, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ProjectBrief {
  id: string;
  level: string;
  projectType: string;
  industry: string;
  brief: {
    intro: string;
    objective: string;
    requirement_design: string;
    about_page: string;
    home_page: string;
    order_page: string;
    audience: string;
    tips: string;
  };
  generatedAt: string;
}

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectBrief | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch - replace with actual API
    const fetchProject = async () => {
      setLoading(true);
      try {
        // Mock data
        const mockProject: ProjectBrief = {
          id: id || '',
          level: 'beginner',
          projectType: 'Website',
          industry: 'Fashion',
          brief: {
            intro: 'Welcome to your fashion website project. This brief will guide you through creating a modern, elegant online presence for your fashion brand.',
            objective: 'Create a visually stunning website that showcases your fashion collections, tells your brand story, and drives online sales through an intuitive shopping experience.',
            requirement_design: 'Modern, clean design with high-quality imagery. Mobile-first responsive layout. Fast loading times. Accessible navigation. Integration with payment gateway.',
            about_page: 'Tell your brand story. Include founder information, brand values, sustainability practices, and what makes your fashion line unique.',
            home_page: 'Hero section with latest collection. Featured products carousel. Brand story snippet. Social proof (testimonials). Newsletter signup.',
            order_page: 'Product gallery with filters. Quick view feature. Size guide. Secure checkout process. Multiple payment options. Order tracking.',
            audience: 'Fashion-conscious millennials and Gen Z (18-35 years old). Urban professionals. Sustainability-minded consumers. Online shoppers preferring boutique brands.',
            tips: 'Use high-quality product photography. Implement virtual try-on if possible. Offer easy returns. Build email list for new collections. Partner with fashion influencers.'
          },
          generatedAt: new Date().toISOString()
        };
        
        setTimeout(() => {
          setProject(mockProject);
          setLoading(false);
        }, 500);
      } catch (error) {
        toast({
          title: 'Error loading project',
          description: 'Please try again',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, toast]);

  const copySection = (content: string, section: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: `${section} copied to clipboard`,
    });
  };

  const downloadBrief = () => {
    if (!project) return;
    
    const content = Object.entries(project.brief)
      .map(([key, value]) => `## ${key.replace(/_/g, ' ').toUpperCase()}\n\n${value}\n\n`)
      .join('');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-brief-${project.id}.md`;
    a.click();
    
    toast({
      title: 'Downloaded!',
      description: 'Project brief saved as markdown',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block"
          >
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
          </motion.div>
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Project not found</h1>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const sections = [
    { key: 'intro', title: '1. Intro', content: project.brief.intro },
    { key: 'objective', title: '2. Objective', content: project.brief.objective },
    { key: 'requirement_design', title: '3. Requirement Design', content: project.brief.requirement_design },
    { key: 'about_page', title: '4. About Page', content: project.brief.about_page },
    { key: 'home_page', title: '5. Home Page', content: project.brief.home_page },
    { key: 'order_page', title: '6. Order Page', content: project.brief.order_page },
    { key: 'audience', title: '7. Audience', content: project.brief.audience },
    { key: 'tips', title: '8. Tips', content: project.brief.tips },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Project Brief</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{project.level}</Badge>
                <Badge variant="outline">{project.projectType}</Badge>
                <Badge variant="outline">{project.industry}</Badge>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={downloadBrief}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - Project info */}
          <div className="lg:col-span-1">
            <Card className="glass-card sticky top-4">
              <CardHeader>
                <CardTitle className="text-sm">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium text-foreground">{project.projectType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Industry</p>
                  <p className="font-medium text-foreground">{project.industry}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Level</p>
                  <p className="font-medium text-foreground capitalize">{project.level}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Generated</p>
                  <p className="font-medium text-foreground">
                    {new Date(project.generatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content - Brief sections */}
          <div className="lg:col-span-3 space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copySection(section.content, section.title)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
