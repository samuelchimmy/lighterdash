import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, X } from 'lucide-react';
import { LightBulbIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const paragraphs = text.split(/\n\n+/);
  
  return paragraphs.map((paragraph, pIndex) => {
    // Check if it's a numbered list item
    const numberedListMatch = paragraph.match(/^(\d+)\.\s+\*\*(.+?)\*\*:?\s*([\s\S]*)/);
    if (numberedListMatch) {
      const [, number, title, content] = numberedListMatch;
      return (
        <div key={pIndex} className="flex gap-2.5 mb-3 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${pIndex * 100}ms` }}>
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
            {number}
          </span>
          <div className="flex-1">
            <span className="font-semibold text-foreground text-xs">{title}</span>
            {content && <span className="text-muted-foreground text-xs">: {content.trim()}</span>}
          </div>
        </div>
      );
    }
    
    // Check for bullet points
    if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('• ')) {
      const bulletContent = paragraph.replace(/^[-•]\s+/, '');
      return (
        <div key={pIndex} className="flex gap-2 mb-2 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${pIndex * 100}ms` }}>
          <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
          <span className="text-xs text-foreground">{formatBoldText(bulletContent)}</span>
        </div>
      );
    }
    
    // Regular paragraph
    return (
      <p key={pIndex} className="text-xs text-foreground leading-relaxed mb-2.5 last:mb-0 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${pIndex * 80}ms` }}>
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
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`gap-1.5 text-primary hover:text-primary hover:bg-primary/10 transition-all duration-300 group hover:scale-105 active:scale-95 ${className}`}
      >
        <LightBulbIcon className="w-4 h-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
        <span className="text-xs font-medium">AI Insight</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl w-[90vw] bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 shadow-2xl p-0 gap-0 overflow-hidden">
          {/* Animated background glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
          
          <DialogHeader className="p-5 pb-4 border-b border-border/50 relative">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 animate-in zoom-in duration-300">
                <LightBulbIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="animate-in slide-in-from-left-4 duration-300">
                <DialogTitle className="font-semibold text-foreground text-base">AI Analysis</DialogTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">Powered by AI insights</p>
              </div>
            </div>
          </DialogHeader>
          
          {/* Content */}
          <div className="relative">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-primary/10 animate-ping absolute inset-0" />
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center relative">
                    <Loader2 className="w-7 h-7 animate-spin text-primary" />
                  </div>
                </div>
                <div className="text-center animate-in fade-in duration-500">
                  <p className="text-sm font-medium text-foreground">Analyzing your data...</p>
                  <p className="text-[11px] text-muted-foreground mt-1">This may take a few seconds</p>
                </div>
              </div>
            ) : error ? (
              <div className="py-10 text-center px-5 animate-in fade-in zoom-in duration-300">
                <div className="w-12 h-12 rounded-full bg-destructive/10 mx-auto mb-3 flex items-center justify-center">
                  <X className="w-5 h-5 text-destructive" />
                </div>
                <p className="text-sm text-destructive font-medium mb-3">Failed to generate insight</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()} 
                  className="text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-300"
                >
                  Try again
                </Button>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <ScrollArea className="h-[350px]">
                  <div className="p-5">
                    <div className="bg-background/60 backdrop-blur-sm rounded-xl p-4 border border-border/30">
                      {insight && formatInsightText(insight)}
                    </div>
                  </div>
                </ScrollArea>
                <div className="flex items-center justify-between px-5 py-3 border-t border-border/30 bg-muted/30">
                  <span className="text-[10px] text-muted-foreground/70">AI-generated • Results may vary</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => refetch()}
                    className="text-[11px] h-7 px-3 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105"
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}