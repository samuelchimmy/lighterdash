import { useState } from "react";
import { Calculator } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { AssetSelector, MARKETS, type Market } from "@/components/calculators/AssetSelector";
import { PnLCalculator } from "@/components/calculators/PnLCalculator";
import { LiquidationCalculator } from "@/components/calculators/LiquidationCalculator";
import { TargetPriceCalculator } from "@/components/calculators/TargetPriceCalculator";
import { MaxOpenCalculator } from "@/components/calculators/MaxOpenCalculator";
import { OpenPriceCalculator } from "@/components/calculators/OpenPriceCalculator";

export default function FuturesCalculator() {
  const [selectedMarket, setSelectedMarket] = useState<Market>(MARKETS[0]);

  return (
    <Layout>
      <div className="container py-6 px-4 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-2.5 mb-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Calculator className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">
              Futures Calculator
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Calculate PnL, liquidation, and target prices
            </p>
          </div>
        </div>

        {/* Asset Selector */}
        <div className="mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '50ms' }}>
          <AssetSelector 
            selectedMarket={selectedMarket}
            onMarketChange={setSelectedMarket}
          />
        </div>

        <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-4">
            <Tabs defaultValue="pnl" className="w-full">
              <TabsList className="w-full justify-start mb-4 bg-secondary/30 border border-border/50 p-0.5 rounded-lg h-auto flex-wrap">
                <TabsTrigger 
                  value="pnl"
                  className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm px-2.5 py-1 text-[10px] font-medium"
                >
                  PnL
                </TabsTrigger>
                <TabsTrigger 
                  value="target"
                  className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm px-2.5 py-1 text-[10px] font-medium"
                >
                  Target Price
                </TabsTrigger>
                <TabsTrigger 
                  value="liquidation"
                  className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm px-2.5 py-1 text-[10px] font-medium"
                >
                  Liquidation
                </TabsTrigger>
                <TabsTrigger 
                  value="maxopen"
                  className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm px-2.5 py-1 text-[10px] font-medium"
                >
                  Max Open
                </TabsTrigger>
                <TabsTrigger 
                  value="openprice"
                  className="rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm px-2.5 py-1 text-[10px] font-medium"
                >
                  Open Price
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pnl" className="mt-3">
                <PnLCalculator selectedMarket={selectedMarket} />
              </TabsContent>

              <TabsContent value="target" className="mt-3">
                <TargetPriceCalculator selectedMarket={selectedMarket} />
              </TabsContent>

              <TabsContent value="liquidation" className="mt-3">
                <LiquidationCalculator />
              </TabsContent>

              <TabsContent value="maxopen" className="mt-3">
                <MaxOpenCalculator selectedMarket={selectedMarket} />
              </TabsContent>

              <TabsContent value="openprice" className="mt-3">
                <OpenPriceCalculator selectedMarket={selectedMarket} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}