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

const TradeAnalyzer = () => {
  const { trades, analysis, isLoading, error, fileName, handleFileUpload, clearData } = useTradeAnalysis();
  const { toast } = useToast();

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
          <section className="text-center mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <LineChart className="w-4 h-4 text-primary" />
              </div>
              <h1 className="text-base font-semibold text-foreground">
                AI Trader Insights
              </h1>
            </div>
            <p className="text-[10px] text-muted-foreground max-w-xl mx-auto">
              Upload your trade history CSV to unlock comprehensive analytics, behavioral insights, 
              and AI-powered recommendations to improve your trading performance.
            </p>
          </section>

          {/* CSV Uploader */}
          <CSVUploader
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            fileName={fileName}
            error={error}
            onClear={clearData}
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
            <div className="text-center py-10 animate-in fade-in duration-500">
              <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-3">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">No Data Yet</h3>
              <p className="text-[10px] text-muted-foreground max-w-sm mx-auto">
                Upload your trade history CSV to see comprehensive analytics and AI-powered insights 
                about your trading performance.
              </p>
              <div className="mt-4 p-3 bg-muted/50 border border-border/50 rounded-lg max-w-sm mx-auto">
                <p className="text-[10px] text-muted-foreground">
                  <strong className="text-foreground">Expected CSV columns:</strong><br />
                  Date, Market, Side, Size, Price, Closed PnL, Fee, Role, Type
                </p>
                <p className="text-[9px] text-muted-foreground mt-1.5">
                  <strong className="text-foreground">Tip:</strong> Click "Aggregate" on Lighter before exporting.
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