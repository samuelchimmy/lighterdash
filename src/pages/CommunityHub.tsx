import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityLeaderboard } from "@/components/CommunityLeaderboard";
import { CopyTradingSignals } from "@/components/CopyTradingSignals";
import { MultiWalletComparison } from "@/components/MultiWalletComparison";
import { BacktestingTool } from "@/components/BacktestingTool";

export default function CommunityHub() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Community Hub
          </h1>
          <p className="text-muted-foreground">
            Compete, collaborate, and learn from the best traders
          </p>
        </div>

        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="signals">Copy Trading</TabsTrigger>
            <TabsTrigger value="compare">Compare</TabsTrigger>
            <TabsTrigger value="backtest">Backtest</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="mt-6">
            <CommunityLeaderboard />
          </TabsContent>

          <TabsContent value="signals" className="mt-6">
            <CopyTradingSignals />
          </TabsContent>

          <TabsContent value="compare" className="mt-6">
            <MultiWalletComparison />
          </TabsContent>

          <TabsContent value="backtest" className="mt-6">
            <BacktestingTool />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
