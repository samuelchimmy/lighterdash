import { MarketStats } from "@/components/MarketStats";
import { OrderBookDepth } from "@/components/OrderBookDepth";
import { LiveTradeFeed } from "@/components/LiveTradeFeed";
import { PlatformVolume } from "@/components/PlatformVolume";
import { Layout } from "@/components/Layout";
import { BarChart3, Activity } from "lucide-react";

const LighterAnalytics = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Page Header */}
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">
                Lighter Analytics
              </h1>
              <p className="text-xs text-muted-foreground">
                Real-time market data and analytics
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-card via-card to-primary/5 border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-1.5">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                About Analytics
              </h3>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Track real-time market data across all Lighter perpetual markets. View live order books, 
              recent trades, funding rates, and comprehensive market statistics.
            </p>
          </div>

          {/* Platform Volume Overview */}
          <PlatformVolume />

          {/* Market Stats Overview - Collapsible */}
          <MarketStats />

          {/* Order Book & Live Trades Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <OrderBookDepth />
            <LiveTradeFeed />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LighterAnalytics;