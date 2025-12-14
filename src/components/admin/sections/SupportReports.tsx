import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  HeadphonesIcon, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FlaggedItem {
  id: string;
  type: 'user' | 'project' | 'system';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'reviewing' | 'resolved';
  timestamp: string;
}

export const SupportReports = () => {
  const [loading, setLoading] = useState(false);

  // Mock data - in production this would come from a support tickets table
  const flaggedItems: FlaggedItem[] = [
    {
      id: '1',
      type: 'user',
      title: 'Excessive API calls detected',
      description: 'User user@example.com has exceeded normal API usage patterns',
      severity: 'high',
      status: 'open',
      timestamp: '5 mins ago'
    },
    {
      id: '2',
      type: 'project',
      title: 'Flagged content in generation',
      description: 'Project "E-commerce Site" contains potentially inappropriate content',
      severity: 'medium',
      status: 'reviewing',
      timestamp: '2 hours ago'
    },
    {
      id: '3',
      type: 'system',
      title: 'Generation failure spike',
      description: 'Increased failure rate detected in project generation',
      severity: 'high',
      status: 'open',
      timestamp: '1 hour ago'
    },
    {
      id: '4',
      type: 'user',
      title: 'Quota exceeded notification',
      description: 'Multiple users hitting quota limits',
      severity: 'low',
      status: 'resolved',
      timestamp: '1 day ago'
    }
  ];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Open</Badge>;
      case 'reviewing':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Reviewing</Badge>;
      case 'resolved':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <AlertCircle className="h-5 w-5 text-primary" />;
      case 'project':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'system':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const openCount = flaggedItems.filter(i => i.status === 'open').length;
  const reviewingCount = flaggedItems.filter(i => i.status === 'reviewing').length;
  const resolvedCount = flaggedItems.filter(i => i.status === 'resolved').length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold flex items-center gap-3">
            <HeadphonesIcon className="h-7 w-7 text-primary" />
            Support & Reports
          </h1>
          <p className="text-foreground-secondary mt-1">Review flagged items and system issues</p>
        </div>
        <Button disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{openCount}</p>
              <p className="text-sm text-foreground-secondary">Open Issues</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reviewingCount}</p>
              <p className="text-sm text-foreground-secondary">Under Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{resolvedCount}</p>
              <p className="text-sm text-foreground-secondary">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Items */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Flagged Items & Reports</CardTitle>
          <CardDescription>Items requiring admin attention</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {flaggedItems.map((item) => (
            <div 
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-shrink-0">
                {getTypeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-medium">{item.title}</p>
                  {getSeverityBadge(item.severity)}
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-sm text-foreground-secondary">{item.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
