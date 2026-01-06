import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Copy, Download, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

interface BriefData {
  company_name: string;
  tagline: string;
  slogan: string;
  location: string;
  primary_color_palette: string[];
  design_style_keywords: string[];
  intro: string;
  objective: string;
  requirement_design: string;
  about_page: string;
  home_page: string;
  order_page: string;
  audience: string;
  tips: string;
}

interface ProjectBrief {
  id: string;
  level: string;
  type: string;
  industry: string;
  brief_data: BriefData | null;
  created_at: string;
  status?: string;
}

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectBrief | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setProject(data as any as ProjectBrief);
        }
      } catch (error) {
        console.error('Error loading project:', error);
        toast({
          title: 'Error loading project',
          description: 'Please try again',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();

    // Set up realtime subscription for project updates
    const channel = supabase
      .channel('project-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Project updated via realtime:', payload);
          setProject(payload.new as any as ProjectBrief);
          
          if (payload.new.status === 'completed') {
            toast({
              title: 'Brief Ready!',
              description: 'Your project brief has been generated successfully',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, toast]);

  const copySection = (content: string, section: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: `${section} copied to clipboard`,
    });
  };

  const downloadBriefAsPDF = () => {
    if (!project || !project.brief_data) return;
    
    const data = Array.isArray(project.brief_data) 
      ? project.brief_data[0] 
      : project.brief_data;
    
    if (!data || typeof data !== 'object') return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let yPosition = 20;

    const addText = (text: string, fontSize: number, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text || '', maxWidth);
      
      for (const line of lines) {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      }
      yPosition += 5;
    };

    // Title
    addText(data.company_name || 'Project Brief', 20, true);
    addText(data.tagline || '', 12);
    addText(data.slogan || '', 10);
    yPosition += 5;
    
    addText(`Location: ${data.location || 'N/A'}`, 10);
    addText(`Colors: ${(data.primary_color_palette || []).join(', ')}`, 10);
    addText(`Design Style: ${(data.design_style_keywords || []).join(', ')}`, 10);
    yPosition += 10;

    const sections = [
      { title: '1. Introduction', content: data.intro },
      { title: '2. Project Objective', content: data.objective },
      { title: '3. Design Requirements', content: data.requirement_design },
      { title: '4. About Page', content: data.about_page },
      { title: '5. Home Page', content: data.home_page },
      { title: '6. Order Page', content: data.order_page },
      { title: '7. Target Audience', content: data.audience },
      { title: '8. Implementation Tips', content: data.tips },
    ];

    sections.forEach(section => {
      addText(section.title, 14, true);
      addText(section.content || 'N/A', 10);
      yPosition += 5;
    });

    const fileName = `${(data.company_name || 'project').replace(/\s+/g, '-').toLowerCase()}-brief.pdf`;
    doc.save(fileName);
    
    toast({
      title: 'Downloaded!',
      description: 'Project brief saved as PDF',
    });
  };

  const shareBrief = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: project?.brief_data ? 
            (Array.isArray(project.brief_data) ? project.brief_data[0]?.company_name : project.brief_data.company_name) 
            : 'Project Brief',
          text: 'Check out this project brief!',
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Link Copied!',
      description: 'Project link copied to clipboard',
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

  if (project.status === 'generating' || !project.brief_data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Generating Your Brief</h1>
          <p className="text-muted-foreground mb-4">
            Our AI is crafting a personalized project brief for you. This usually takes 30-60 seconds.
          </p>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm text-muted-foreground"
          >
            Please wait...
          </motion.div>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Handle both array and object format from n8n
  const briefData = Array.isArray(project.brief_data) 
    ? project.brief_data[0] 
    : project.brief_data;

  // Safety check - ensure we have valid brief data
  if (!briefData || typeof briefData !== 'object') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Invalid project data</h1>
          <p className="text-muted-foreground mb-4">The project brief data is corrupted or incomplete.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const sections = [
    { key: 'intro', title: '1. Introduction', content: briefData.intro },
    { key: 'objective', title: '2. Project Objective', content: briefData.objective },
    { key: 'requirement_design', title: '3. Design & Technical Requirements', content: briefData.requirement_design },
    { key: 'about_page', title: '4. About Page Content', content: briefData.about_page },
    { key: 'home_page', title: '5. Home Page Structure', content: briefData.home_page },
    { key: 'order_page', title: '6. Order/Product Page', content: briefData.order_page },
    { key: 'audience', title: '7. Target Audience', content: briefData.audience },
    { key: 'tips', title: '8. Implementation Tips', content: briefData.tips },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header - stacks on mobile */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 mt-1"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">
                {briefData.company_name}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mt-1 break-words">
                {briefData.tagline}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                <Badge variant="outline" className="text-xs">{project.level}</Badge>
                <Badge variant="outline" className="text-xs">{project.type}</Badge>
                <Badge variant="outline" className="text-xs">{project.industry}</Badge>
              </div>
            </div>
          </div>

          {/* Action buttons - full width on mobile */}
          <div className="flex gap-2 ml-0 sm:ml-12">
            <Button variant="outline" size="sm" onClick={downloadBriefAsPDF} className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Download </span>PDF
            </Button>
            <Button variant="outline" size="sm" onClick={shareBrief} className="flex-1 sm:flex-none">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Left sidebar - Project info (shows at top on mobile, side on desktop) */}
          <div className="lg:col-span-1 order-1 lg:order-none">
            <Card className="glass-card lg:sticky lg:top-4">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-sm">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs sm:text-sm">Slogan</p>
                  <p className="font-medium text-foreground break-words">{briefData.slogan}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs sm:text-sm">Location</p>
                  <p className="font-medium text-foreground break-words">{briefData.location}</p>
                </div>
                
                {/* Grid for metadata on mobile */}
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs sm:text-sm">Type</p>
                    <p className="font-medium text-foreground text-xs sm:text-sm">{project.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs sm:text-sm">Industry</p>
                    <p className="font-medium text-foreground text-xs sm:text-sm">{project.industry}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs sm:text-sm">Level</p>
                    <p className="font-medium text-foreground capitalize text-xs sm:text-sm">{project.level}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-muted-foreground mb-2 text-xs sm:text-sm">Color Palette</p>
                  <div className="flex gap-2 flex-wrap">
                    {briefData.primary_color_palette.map((color, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div 
                          className="h-6 w-6 sm:h-8 sm:w-8 rounded-md border border-border shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-[10px] sm:text-xs text-muted-foreground">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 text-xs sm:text-sm">Design Style</p>
                  <div className="flex flex-wrap gap-1">
                    {briefData.design_style_keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[10px] sm:text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs sm:text-sm">Generated</p>
                  <p className="font-medium text-foreground text-xs sm:text-sm">
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content - Brief sections */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6 order-2">
            {sections.map((section, index) => (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card overflow-hidden">
                  <CardHeader className="pb-2 sm:pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base sm:text-lg leading-tight">
                        {section.title}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 h-8 w-8 p-0"
                        onClick={() => copySection(section.content, section.title)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
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
