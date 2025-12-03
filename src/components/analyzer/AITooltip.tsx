import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Loader2 } from 'lucide-react';
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-1.5 text-primary hover:text-primary hover:bg-primary/10 ${className}`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-xs">AI Insight</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-card border-border" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium text-sm">AI Analysis</span>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Analyzing...</span>
            </div>
          ) : error ? (
            <div className="text-sm text-destructive">
              <p>Failed to generate insight.</p>
              <Button variant="link" size="sm" onClick={() => refetch()} className="p-0 h-auto">
                Try again
              </Button>
            </div>
          ) : (
            <p className="text-sm text-foreground leading-relaxed">{insight}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
