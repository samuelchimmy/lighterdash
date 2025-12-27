import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LineChart, Upload, BarChart3, Activity, FileDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { CSVUploader } from '@/components/analyzer/CSVUploader';
import { PerformanceOverview } from '@/components/analyzer/PerformanceOverview';
import { TradingHabitsAnalysis } from '@/components/analyzer/TradingHabitsAnalysis';
import { MarketBreakdown } from '@/components/analyzer/MarketBreakdown';
import { useTradeAnalysis } from '@/hooks/use-trade-analysis';
import { exportTradeAnalysisToPDF } from '@/lib/trade-analysis-pdf';
import { useToast } from '@/hooks/use-toast';
import { CSVTrade } from '@/lib/csv-trade-analyzer';

const TradeAnalyzer = () => {
  const { 
    trades, 
    analysis, 
    isLoading, 
    error, 
    fileName, 
    detectedExchange,
    needsMapping,
    handleFileUpload, 
    setTrades,
    clearData 
  } = useTradeAnalysis();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle navigation to column mapper when needed
  useEffect(() => {
    if (needsMapping) {
      navigate('/trade-analyzer/map-columns');
    }
  }, [needsMapping, navigate]);

  // Load mapped trades from sessionStorage if coming from column mapper
  useEffect(() => {
    const mapped = searchParams.get('mapped');
    if (mapped === 'true') {
      const storedTrades = sessionStorage.getItem('mappedTrades');
      if (storedTrades) {
        try {
          const parsedTrades = JSON.parse(storedTrades) as CSVTrade[];
          // Convert date strings back to Date objects
          const tradesWithDates = parsedTrades.map(trade => ({
            ...trade,
            date: new Date(trade.date)
          }));
          setTrades(tradesWithDates);
          sessionStorage.removeItem('mappedTrades');
          // Clean up URL
          navigate('/trade-analyzer', { replace: true });
        } catch (err) {
          console.error('Failed to load mapped trades:', err);
        }
      }
    }
  }, [searchParams, setTrades, navigate]);

  const handleExportPDF = () => {
    if (!analysis) return;
    try {
      exportTradeAnalysisToPDF(analysis, fileName || undefined);
      toast({
        title: 'PDF Exported',
        description: 'Your analysis report has been downloaded.',
      });
    } catch (err) {
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF report.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-5">
          {/* Hero Section */}
          <section className="text-center mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <LineChart className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Universal AI Trade Analyzer
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Upload your trade history from any exchange. We auto-detect Lighter, Nado, and Hyperliquid formats.
              For other exchanges, our AI will help map your columns.
            </p>
          </section>

          {/* CSV Uploader */}
          <CSVUploader
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            fileName={fileName}
            error={error}
            onClear={clearData}
            detectedExchange={detectedExchange}
          />

          {/* Analysis Results */}
          {analysis && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Tabs defaultValue="overview" className="w-full">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <TabsList className="grid grid-cols-3 bg-muted/50 p-0.5 rounded-lg h-8">
                    <TabsTrigger value="overview" className="gap-1 rounded-md text-[10px] h-7 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                      <BarChart3 className="w-3 h-3" />
                      <span className="hidden sm:inline">Performance</span>
                    </TabsTrigger>
                    <TabsTrigger value="habits" className="gap-1 rounded-md text-[10px] h-7 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                      <Activity className="w-3 h-3" />
                      <span className="hidden sm:inline">Trading Habits</span>
                    </TabsTrigger>
                    <TabsTrigger value="markets" className="gap-1 rounded-md text-[10px] h-7 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                      <LineChart className="w-3 h-3" />
                      <span className="hidden sm:inline">Markets</span>
                    </TabsTrigger>
                  </TabsList>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    className="h-8 gap-1.5 text-[10px]"
                  >
                    <FileDown className="w-3 h-3" />
                    Export PDF
                  </Button>
                </div>

                <TabsContent value="overview">
                  <PerformanceOverview
                    kpis={analysis.kpis}
                    cumulativePnL={analysis.cumulativePnL}
                    periodPnL={analysis.periodPnL}
                  />
                </TabsContent>

                <TabsContent value="habits">
                  <TradingHabitsAnalysis
                    sideAnalysis={analysis.sideAnalysis}
                    roleAnalysis={analysis.roleAnalysis}
                    typeAnalysis={analysis.typeAnalysis}
                    hourlyPatterns={analysis.hourlyPatterns}
                    dailyPatterns={analysis.dailyPatterns}
                  />
                </TabsContent>

                <TabsContent value="markets">
                  <MarketBreakdown marketBreakdown={analysis.marketBreakdown} />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Empty State */}
          {!analysis && !isLoading && !error && (
            <div className="text-center py-12 animate-in fade-in duration-500">
              <div className="p-4 rounded-xl bg-primary/10 w-fit mx-auto mb-4">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Upload Any Trade History</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We support Lighter, Nado, Hyperliquid, and any other exchange with AI-powered column mapping.
              </p>
              <div className="mt-5 p-4 bg-muted/50 border border-border/50 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Supported exchanges:</strong><br />
                  Lighter, Nado, Hyperliquid (auto-detected)<br />
                  + Any CSV with AI-assisted mapping
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TradeAnalyzer;
