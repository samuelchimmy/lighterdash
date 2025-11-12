import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetSelector, MARKETS, type Market } from "@/components/calculators/AssetSelector";
import { PnLCalculator } from "@/components/calculators/PnLCalculator";
import { LiquidationCalculator } from "@/components/calculators/LiquidationCalculator";
import { TargetPriceCalculator } from "@/components/calculators/TargetPriceCalculator";
import { MaxOpenCalculator } from "@/components/calculators/MaxOpenCalculator";
import { OpenPriceCalculator } from "@/components/calculators/OpenPriceCalculator";

export default function FuturesCalculator() {
  const navigate = useNavigate();
  const [selectedMarket, setSelectedMarket] = useState<Market>(MARKETS[0]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Calculator className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Lighter Futures Calculator
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 px-4 max-w-6xl mx-auto">
        {/* Asset Selector */}
        <div className="mb-6">
          <AssetSelector 
            selectedMarket={selectedMarket}
            onMarketChange={setSelectedMarket}
          />
        </div>

        <Tabs defaultValue="pnl" className="w-full">
          <TabsList className="w-full justify-start mb-8 bg-transparent border-b border-border rounded-none p-0 h-auto">
            <TabsTrigger 
              value="pnl"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              PnL
            </TabsTrigger>
            <TabsTrigger 
              value="target"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Target Price
            </TabsTrigger>
            <TabsTrigger 
              value="liquidation"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Liquidation Price
            </TabsTrigger>
            <TabsTrigger 
              value="maxopen"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Max Open
            </TabsTrigger>
            <TabsTrigger 
              value="openprice"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
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
      </main>

      <Footer />
    </div>
  );
}
