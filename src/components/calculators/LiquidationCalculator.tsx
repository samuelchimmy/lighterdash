import { useState } from "react";
import { EnhancedSideToggle } from "./EnhancedSideToggle";
import { EnhancedLeverageInput } from "./EnhancedLeverageInput";
import { EnhancedCalculatorInput } from "./EnhancedCalculatorInput";
import { ResultsDisplay } from "./ResultsDisplay";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  calculateLiquidationPrice,
  formatCurrency,
  formatPercentage,
  parseNumberInput,
  Side,
} from "@/lib/calculator-utils";

export function LiquidationCalculator() {
  const [side, setSide] = useState<Side>('long');
  const [leverage, setLeverage] = useState(10);
  const [entryPrice, setEntryPrice] = useState('');
  const [liquidationPrice, setLiquidationPrice] = useState('--');
  const [distanceToLiquidation, setDistanceToLiquidation] = useState('--');

  const handleCalculate = () => {
    const entry = parseNumberInput(entryPrice);

    if (entry > 0 && leverage > 0) {
      const liqPrice = calculateLiquidationPrice(side, entry, leverage);
      const distance = Math.abs((liqPrice - entry) / entry * 100);
      
      setLiquidationPrice(formatCurrency(liqPrice) + ' USDT');
      setDistanceToLiquidation(formatPercentage(distance) + '%');
    } else {
      setLiquidationPrice('--');
      setDistanceToLiquidation('--');
    }
  };

  return (
    <div className="space-y-4">
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-sm text-foreground">
          This is an estimate. Maintenance margin requirements may vary based on position size and market conditions.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <EnhancedSideToggle side={side} onSideChange={setSide} />
          
          <EnhancedLeverageInput leverage={leverage} onLeverageChange={setLeverage} />
          
          <EnhancedCalculatorInput
            label="Entry Price"
            value={entryPrice}
            onChange={setEntryPrice}
            suffix="USDT"
          />

          <Button 
            onClick={handleCalculate}
            className="w-full h-12 bg-primary hover:bg-primary/90"
          >
            Calculate
          </Button>
        </div>

        <ResultsDisplay
          results={[
            {
              label: "Liquidation Price",
              value: liquidationPrice,
              colorClass: "text-destructive",
            },
            {
              label: "Distance to Liquidation",
              value: distanceToLiquidation,
            },
          ]}
        />
      </div>
    </div>
  );
}
