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
        className="w-96 bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 shadow-xl" 
        align="end"
      >
        <div className="space-y-4">
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
          
          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
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
            <div className="py-6 text-center">
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
              <div className="bg-background/50 rounded-xl p-4 border border-border/30">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{insight}</p>
              </div>
              <div className="flex items-center justify-between pt-2">
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
        </div>
      </PopoverContent>
    </Popover>
  );
}