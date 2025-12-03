import { useNavigate } from 'react-router-dom';
import { LineChart, ArrowLeft, Upload, BarChart3, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Footer } from '@/components/Footer';
import { CSVUploader } from '@/components/analyzer/CSVUploader';
import { PerformanceOverview } from '@/components/analyzer/PerformanceOverview';
import { TradingHabitsAnalysis } from '@/components/analyzer/TradingHabitsAnalysis';
import { MarketBreakdown } from '@/components/analyzer/MarketBreakdown';
import { useTradeAnalysis } from '@/hooks/use-trade-analysis';

const TradeAnalyzer = () => {
  const navigate = useNavigate();
  const { trades, analysis, isLoading, error, fileName, handleFileUpload, clearData } = useTradeAnalysis();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <LineChart className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                Trader Insights
              </h1>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Back to Dashboard</span>
            </Button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <section className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
              AI-Powered Trading Journal
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
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
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="overview" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Performance</span>
                  </TabsTrigger>
                  <TabsTrigger value="habits" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <Activity className="w-4 h-4" />
                    <span className="hidden sm:inline">Trading Habits</span>
                  </TabsTrigger>
                  <TabsTrigger value="markets" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                    <LineChart className="w-4 h-4" />
                    <span className="hidden sm:inline">Markets</span>
                  </TabsTrigger>
                </TabsList>

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
            <div className="text-center py-16 animate-in fade-in duration-500">
              <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto mb-4">
                <Upload className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Data Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Upload your trade history CSV to see comprehensive analytics and AI-powered insights 
                about your trading performance.
              </p>
              <div className="mt-6 p-4 bg-muted/50 border border-border/50 rounded-xl max-w-md mx-auto">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Expected CSV columns:</strong><br />
                  Date, Market, Side, Size, Price, Closed PnL, Fee, Role, Type
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TradeAnalyzer;
