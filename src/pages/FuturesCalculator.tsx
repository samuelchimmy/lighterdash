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
      <div className="container py-8 px-4 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Lighter Futures Calculator
          </h1>
        </div>

        {/* Asset Selector */}
        <div className="mb-6">
          <AssetSelector 
            selectedMarket={selectedMarket}
            onMarketChange={setSelectedMarket}
          />
        </div>

        <Tabs defaultValue="pnl" className="w-full">
          <TabsList className="w-full justify-start mb-8 bg-secondary/30 border border-border/50 p-1 rounded-xl h-auto flex-wrap">
            <TabsTrigger 
              value="pnl"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2"
            >
              PnL
            </TabsTrigger>
            <TabsTrigger 
              value="target"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2"
            >
              Target Price
            </TabsTrigger>
            <TabsTrigger 
              value="liquidation"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2"
            >
              Liquidation Price
            </TabsTrigger>
            <TabsTrigger 
              value="maxopen"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2"
            >
              Max Open
            </TabsTrigger>
            <TabsTrigger 
              value="openprice"
              className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2"
            >
              Open Price
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pnl" className="mt-6">
            <PnLCalculator selectedMarket={selectedMarket} />
          </TabsContent>

          <TabsContent value="target" className="mt-6">
            <TargetPriceCalculator selectedMarket={selectedMarket} />
          </TabsContent>

          <TabsContent value="liquidation" className="mt-6">
            <LiquidationCalculator />
          </TabsContent>

          <TabsContent value="maxopen" className="mt-6">
            <MaxOpenCalculator selectedMarket={selectedMarket} />
          </TabsContent>

          <TabsContent value="openprice" className="mt-6">
            <OpenPriceCalculator selectedMarket={selectedMarket} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
