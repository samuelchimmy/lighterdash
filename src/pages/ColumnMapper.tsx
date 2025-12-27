import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTradeDataStore, tradeDataStore } from '@/stores/tradeDataStore';
import { requiredFields, mapCustomToCSVTrade } from '@/lib/exchangeMappings';
import { CSVTrade, analyzeAllTrades } from '@/lib/csv-trade-analyzer';
import { supabase } from '@/integrations/supabase/client';

const ColumnMapper = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const storeState = useTradeDataStore();
  const { rawData, headers } = storeState;
  
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if no data
  useEffect(() => {
    if (!rawData || !headers || headers.length === 0) {
      navigate('/trade-analyzer');
    }
  }, [rawData, headers, navigate]);

  // Fetch AI suggestions on mount
  useEffect(() => {
    const fetchAISuggestions = async () => {
      if (!headers || headers.length === 0) return;
      
      setIsLoadingAI(true);
      try {
        const sampleData = rawData && rawData.length > 0 ? rawData[0] : null;
        
        const { data, error } = await supabase.functions.invoke('auto-map-headers', {
          body: { userHeaders: headers, sampleData }
        });

        if (error) throw error;

        if (data?.mappings) {
          setAiSuggestions(data.mappings);
          // Pre-fill mappings with AI suggestions
          setMappings(data.mappings);
          toast({
            title: '✨ AI Suggestions Ready',
            description: 'We\'ve pre-filled the column mappings. Please verify and adjust if needed.',
          });
        }
      } catch (err) {
        console.error('AI mapping error:', err);
        toast({
          title: 'AI Unavailable',
          description: 'Please manually select the column mappings.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingAI(false);
      }
    };

    fetchAISuggestions();
  }, [headers, rawData, toast]);

  const handleMappingChange = (field: string, value: string) => {
    setMappings(prev => ({
      ...prev,
      [field]: value === 'none' ? '' : value
    }));
  };

  const isAISuggested = (field: string, value: string) => {
    return aiSuggestions[field] === value && value !== '';
  };

  const canSubmit = () => {
    const requiredMappings = requiredFields.filter(f => f.required);
    return requiredMappings.every(field => mappings[field.key] && mappings[field.key] !== '');
  };

  const handleSubmit = async () => {
    if (!rawData || !canSubmit()) return;
    
    setIsProcessing(true);
    
    try {
      const parsedTrades: CSVTrade[] = [];
      let parseErrors = 0;

      rawData.forEach((row) => {
        const trade = mapCustomToCSVTrade(row, mappings);
        if (trade) {
          parsedTrades.push(trade);
        } else {
          parseErrors++;
        }
      });

      if (parsedTrades.length === 0) {
        toast({
          title: 'No Valid Trades',
          description: 'Could not parse any trades with the selected mappings. Please check your column selections.',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      // Store the trades in sessionStorage for the TradeAnalyzer page
      sessionStorage.setItem('mappedTrades', JSON.stringify(parsedTrades));
      
      // Clear the raw data store
      tradeDataStore.clearRawData();

      toast({
        title: 'Success!',
        description: `Imported ${parsedTrades.length} trades${parseErrors > 0 ? ` (${parseErrors} rows skipped)` : ''}.`,
      });

      navigate('/trade-analyzer?mapped=true');
    } catch (err) {
      console.error('Processing error:', err);
      toast({
        title: 'Processing Error',
        description: 'Failed to process trades. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!headers || headers.length === 0) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Header */}
          <section className="text-center mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-base font-semibold text-foreground">
                Map Your Columns
              </h1>
            </div>
            <p className="text-[10px] text-muted-foreground max-w-xl mx-auto">
              We don't recognize this format, but we can still analyze it! 
              Our AI has made its best guess below. Please confirm the mappings to continue.
            </p>
          </section>

          {/* AI Loading State */}
          {isLoadingAI && (
            <Card className="bg-gradient-to-br from-primary/5 via-card to-card border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <div>
                    <p className="text-xs font-medium text-foreground">AI is analyzing your columns...</p>
                    <p className="text-[10px] text-muted-foreground">This usually takes a few seconds</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mapping Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Column Mappings</CardTitle>
              <CardDescription className="text-[10px]">
                Match your CSV columns to our required fields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {requiredFields.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground">{field.label}</span>
                      {field.required && <span className="text-destructive text-[10px]">*</span>}
                    </div>
                    <span className="text-[9px] text-muted-foreground">{field.description}</span>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-2">
                    <Select
                      value={mappings[field.key] || 'none'}
                      onValueChange={(value) => handleMappingChange(field.key, value)}
                      disabled={isLoadingAI}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select column..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-xs text-muted-foreground">
                          — Not mapped —
                        </SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header} className="text-xs">
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {isAISuggested(field.key, mappings[field.key]) && (
                      <Badge variant="outline" className="text-[8px] px-1.5 py-0 bg-primary/5 text-primary border-primary/20 shrink-0">
                        <Sparkles className="w-2 h-2 mr-0.5" />
                        AI
                      </Badge>
                    )}
                    
                    {mappings[field.key] && mappings[field.key] !== '' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-profit shrink-0" />
                    )}
                    
                    {field.required && (!mappings[field.key] || mappings[field.key] === '') && (
                      <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sample Data Preview */}
          {rawData && rawData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Sample Data Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="text-[9px] font-mono bg-muted/50 p-2 rounded-md max-h-24 overflow-y-auto">
                    {Object.entries(rawData[0]).slice(0, 6).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="text-foreground">{String(value)}</span>
                      </div>
                    ))}
                    {Object.keys(rawData[0]).length > 6 && (
                      <div className="text-muted-foreground">...and {Object.keys(rawData[0]).length - 6} more columns</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <Button variant="ghost" onClick={() => navigate('/trade-analyzer')} className="text-xs h-8">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!canSubmit() || isProcessing || isLoadingAI}
              className="gap-2 text-xs h-8"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Analyze Trades
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ColumnMapper;
