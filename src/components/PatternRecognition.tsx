import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { LighterTrade, Position } from '@/types/lighter';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Loader2, Lightbulb } from 'lucide-react';

interface Pattern {
  name: string;
  description: string;
  conditions: string[];
  winRate: number;
  avgPnL?: number;
  sampleSize: number;
  confidence: 'low' | 'medium' | 'high';
  recommendation: string;
}

interface PatternAnalysis {
  patterns: Pattern[];
  summary: string;
  topRecommendations: string[];
}

interface PatternRecognitionProps {
  trades: LighterTrade[];
  positions: Position[];
}

export const PatternRecognition = ({ trades, positions }: PatternRecognitionProps) => {
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzePatterns = async () => {
    if (trades.length < 10) {
      toast({
        title: "Insufficient data",
        description: "Need at least 10 trades to identify patterns",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-patterns', {
        body: { trades, positions }
      });

      if (error) {
        if (error.message.includes("Rate limit")) {
          toast({
            title: "Rate limit exceeded",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
        } else if (error.message.includes("Payment required")) {
          toast({
            title: "Credits required",
            description: "Please add credits to your workspace to use AI analysis.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setAnalysis(data as PatternAnalysis);
      toast({
        title: "Analysis complete",
        description: `Found ${data.patterns.length} trading patterns`,
      });
    } catch (error: any) {
      console.error('Error analyzing patterns:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze patterns",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-success';
      case 'medium': return 'text-primary';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="p-6 bg-card border-border shadow-card hover-glow-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" fill="currentColor" fillOpacity={0.2} />
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Pattern Recognition</h2>
            <p className="text-sm text-muted-foreground">
              Identify high-probability setups from your trading history
            </p>
          </div>
        </div>
        <Button
          onClick={analyzePatterns}
          disabled={isAnalyzing || trades.length < 10}
          className="gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" fill="currentColor" fillOpacity={0.1} />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" fill="currentColor" fillOpacity={0.2} />
              Analyze Patterns
            </>
          )}
        </Button>
      </div>

      {trades.length < 10 && (
        <Alert className="mb-4">
          <AlertCircle className="w-4 h-4" fill="currentColor" fillOpacity={0.2} />
          <AlertDescription>
            Need at least 10 trades to perform pattern analysis. You currently have {trades.length} trades.
          </AlertDescription>
        </Alert>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary mt-0.5" fill="currentColor" fillOpacity={0.2} />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Analysis Summary</h3>
                <p className="text-sm text-foreground">{analysis.summary}</p>
              </div>
            </div>
          </div>

          {/* Top Recommendations */}
          {analysis.topRecommendations.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" fill="currentColor" fillOpacity={0.2} />
                Top Recommendations
              </h3>
              <div className="space-y-2">
                {analysis.topRecommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" fill="currentColor" fillOpacity={0.2} />
                    <span className="text-sm text-foreground">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Identified Patterns */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">
              Identified Patterns ({analysis.patterns.length})
            </h3>
            {analysis.patterns.map((pattern, idx) => (
              <Card key={idx} className="p-4 bg-secondary/30 border-border/50 hover:border-primary/30 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{pattern.name}</h4>
                        <Badge variant={getConfidenceBadgeVariant(pattern.confidence)}>
                          {pattern.confidence} confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-2xl font-bold ${getConfidenceColor(pattern.confidence)}`}>
                        {pattern.winRate.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Win Rate</div>
                      {pattern.avgPnL !== undefined && (
                        <div className={`text-sm mt-1 ${pattern.avgPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                          ${pattern.avgPnL.toFixed(2)} avg
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="space-y-1">
                    <h5 className="text-xs font-medium text-muted-foreground uppercase">Conditions</h5>
                    <div className="flex flex-wrap gap-2">
                      {pattern.conditions.map((condition, cidx) => (
                        <Badge key={cidx} variant="outline" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="p-3 bg-background/50 rounded border border-border/50">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="currentColor" fillOpacity={0.2} />
                      <div>
                        <h5 className="text-xs font-medium text-muted-foreground uppercase mb-1">
                          Recommendation
                        </h5>
                        <p className="text-sm text-foreground">{pattern.recommendation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sample Size */}
                  <div className="text-xs text-muted-foreground">
                    Based on {pattern.sampleSize} trades
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!analysis && !isAnalyzing && trades.length >= 10 && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="currentColor" fillOpacity={0.2} />
          <p className="text-muted-foreground mb-4">
            Click "Analyze Patterns" to discover high-probability trading setups
          </p>
          <p className="text-sm text-muted-foreground">
            AI will analyze {trades.length} trades to identify patterns in timing, size, and market conditions
          </p>
        </div>
      )}
    </Card>
  );
};
