import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PnLCalculator } from "@/components/calculators/PnLCalculator";
import { LiquidationCalculator } from "@/components/calculators/LiquidationCalculator";
import { TargetPriceCalculator } from "@/components/calculators/TargetPriceCalculator";

export default function FuturesCalculator() {
  const navigate = useNavigate();

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
      <main className="container py-8 px-4 max-w-5xl mx-auto">
        <div className="mb-6 text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Plan Your Trades with Precision
          </h2>
          <p className="text-muted-foreground">
            Calculate PnL, liquidation prices, and target prices for your futures positions
          </p>
        </div>

        <Tabs defaultValue="pnl" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="pnl">PnL Calculator</TabsTrigger>
            <TabsTrigger value="liquidation">Liquidation Price</TabsTrigger>
            <TabsTrigger value="target">Target Price</TabsTrigger>
          </TabsList>

          <TabsContent value="pnl" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Profit & Loss Calculator
              </h3>
              <p className="text-sm text-muted-foreground">
                Calculate potential profit, loss, and ROE for your trade
              </p>
            </div>
            <PnLCalculator />
          </TabsContent>

          <TabsContent value="liquidation" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Liquidation Price Estimator
              </h3>
              <p className="text-sm text-muted-foreground">
                Estimate the price at which your position would be liquidated
              </p>
            </div>
            <LiquidationCalculator />
          </TabsContent>

          <TabsContent value="target" className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Target Price Calculator
              </h3>
              <p className="text-sm text-muted-foreground">
                Find the exit price needed to achieve your desired ROE
              </p>
            </div>
            <TargetPriceCalculator />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 mt-12">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>
            Built for the Lighter community • Not financial advice • Always DYOR
          </p>
        </div>
      </footer>
    </div>
  );
}
