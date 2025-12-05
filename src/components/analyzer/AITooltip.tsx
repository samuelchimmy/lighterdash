import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { LightBulbIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface AITooltipProps {
  metricType: string;
  data: Record<string, unknown>;
  className?: string;
}

async function fetchInsight(metricType: string, data: Record<string, unknown>): Promise<string> {
  const { data: result, error } = await supabase.functions.invoke('get-trade-insight', {
    body: { metric_type: metricType, data }
  });

  if (error) throw new Error(error.message);
  return result.insight;
}

// Format AI insight text with proper styling
function formatInsightText(text: string) {
  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  return paragraphs.map((paragraph, pIndex) => {
    // Check if it's a numbered list item (e.g., "1.", "2.", etc.)
    const numberedListMatch = paragraph.match(/^(\d+)\.\s+\*\*(.+?)\*\*:?\s*([\s\S]*)/);
    if (numberedListMatch) {
      const [, number, title, content] = numberedListMatch;
      return (
        <div key={pIndex} className="flex gap-3 mb-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
            {number}
          </span>
          <div className="flex-1">
            <span className="font-semibold text-foreground">{title}</span>
            {content && <span className="text-muted-foreground">: {content.trim()}</span>}
          </div>
        </div>
      );
    }
    
    // Check for bullet points
    if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('• ')) {
      const bulletContent = paragraph.replace(/^[-•]\s+/, '');
      return (
        <div key={pIndex} className="flex gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
          <span className="text-sm text-foreground">{formatBoldText(bulletContent)}</span>
        </div>
      );
    }
    
    // Regular paragraph with bold text handling
    return (
      <p key={pIndex} className="text-sm text-foreground leading-relaxed mb-3 last:mb-0">
        {formatBoldText(paragraph)}
      </p>
    );
  });
}

// Handle **bold** text formatting
function formatBoldText(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) => 
    i % 2 === 1 ? <strong key={i} className="font-semibold text-foreground">{part}</strong> : part
  );
}

export function AITooltip({ metricType, data, className }: AITooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: insight, isLoading, error, refetch } = useQuery({
    queryKey: ['trade-insight', metricType, JSON.stringify(data)],
    queryFn: () => fetchInsight(metricType, data),
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1.5 text-primary hover:text-primary hover:bg-primary/10 transition-all duration-300 group ${className}`}
        >
          <LightBulbIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium">AI Insight</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[420px] max-w-[90vw] bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 shadow-xl p-0" 
        align="end"
      >
        <div className="p-4 pb-0">
          {/* Header */}
          <div className="flex items-center gap-3 pb-3 border-b border-border/50">
            <div className="p-2 rounded-xl bg-primary/10">
              <LightBulbIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">AI Analysis</h4>
              <p className="text-xs text-muted-foreground">Powered by AI insights</p>
            </div>
          </div>
        </div>
          
        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3 px-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-primary/10 animate-pulse" />
              <Loader2 className="w-6 h-6 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Analyzing your data...</p>
              <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
            </div>
          </div>
        ) : error ? (
          <div className="py-6 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 mx-auto mb-3 flex items-center justify-center">
              <span className="text-destructive text-lg">!</span>
            </div>
            <p className="text-sm text-destructive font-medium mb-2">Failed to generate insight</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              className="text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/50"
            >
              Try again
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <ScrollArea className="h-[300px] px-4">
              <div className="bg-background/50 rounded-xl p-4 border border-border/30 my-3">
                {insight && formatInsightText(insight)}
              </div>
            </ScrollArea>
            <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-border/30">
              <span className="text-[10px] text-muted-foreground/70">AI-generated insight • Results may vary</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => refetch()}
                className="text-xs h-7 px-2 hover:bg-primary/10 hover:text-primary"
              >
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}