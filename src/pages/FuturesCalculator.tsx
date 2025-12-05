import { useState } from "react";
import { Calculator } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetSelector, MARKETS, type Market } from "@/components/calculators/AssetSelector";
import { PnLCalculator } from "@/components/calculators/PnLCalculator";
import { LiquidationCalculator } from "@/components/calculators/LiquidationCalculator";
import { TargetPriceCalculator } from "@/components/calculators/TargetPriceCalculator";
import { MaxOpenCalculator } from "@/components/calculators/MaxOpenCalculator";
import { OpenPriceCalculator } from "@/components/calculators/OpenPriceCalculator";

export default function FuturesCalculator() {
  const [selectedMarket, setSelectedMarket] = useState<Market>(MARKETS[0]);

  return (
    <Layout showNav={false}>
      <div className="container py-6 px-4 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-2.5 mb-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Calculator className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-base font-semibold text-foreground">
            Futures Calculator
          </h1>
        </div>

        {/* Asset Selector */}
        <div className="mb-5 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '50ms' }}>
          <AssetSelector 
            selectedMarket={selectedMarket}
            onMarketChange={setSelectedMarket}
          />
        </div>

        <Tabs defaultValue="pnl" className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '100ms' }}>
          <TabsList className="w-full justify-start mb-6 bg-secondary/30 border border-border/50 p-0.5 rounded-lg h-auto flex-wrap">
            <TabsTrigger 
              value="pnl"
              className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 py-1.5 text-xs font-medium"
            >
              PnL
            </TabsTrigger>
            <TabsTrigger 
              value="target"
              className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 py-1.5 text-xs font-medium"
            >
              Target Price
            </TabsTrigger>
            <TabsTrigger 
              value="liquidation"
              className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 py-1.5 text-xs font-medium"
            >
              Liquidation
            </TabsTrigger>
            <TabsTrigger 
              value="maxopen"
              className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 py-1.5 text-xs font-medium"
            >
              Max Open
            </TabsTrigger>
            <TabsTrigger 
              value="openprice"
              className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm px-3 py-1.5 text-xs font-medium"
            >
              Open Price
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pnl" className="mt-4">
            <PnLCalculator selectedMarket={selectedMarket} />
          </TabsContent>

          <TabsContent value="target" className="mt-4">
            <TargetPriceCalculator selectedMarket={selectedMarket} />
          </TabsContent>

          <TabsContent value="liquidation" className="mt-4">
            <LiquidationCalculator />
          </TabsContent>

          <TabsContent value="maxopen" className="mt-4">
            <MaxOpenCalculator selectedMarket={selectedMarket} />
          </TabsContent>

          <TabsContent value="openprice" className="mt-4">
            <OpenPriceCalculator selectedMarket={selectedMarket} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}