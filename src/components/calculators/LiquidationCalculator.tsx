import { useState, useEffect } from "react";
import { SideToggle } from "./SideToggle";
import { LeverageInput } from "./LeverageInput";
import { CalculatorInput } from "./CalculatorInput";
import { CalculatorOutput } from "./CalculatorOutput";
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
  const [liquidationPrice, setLiquidationPrice] = useState(0);
  const [distanceToLiquidation, setDistanceToLiquidation] = useState(0);

  useEffect(() => {
    const entry = parseNumberInput(entryPrice);

    if (entry > 0 && leverage > 0) {
      const liqPrice = calculateLiquidationPrice(side, entry, leverage);
      setLiquidationPrice(liqPrice);

      // Calculate distance to liquidation as percentage
      const distance = Math.abs((liqPrice - entry) / entry * 100);
      setDistanceToLiquidation(distance);
    } else {
      setLiquidationPrice(0);
      setDistanceToLiquidation(0);
    }
  }, [side, leverage, entryPrice]);

  return (
    <div className="space-y-6">
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-sm text-foreground">
          This is an estimate. Maintenance margin requirements may vary based on position size and market conditions.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <SideToggle side={side} onSideChange={setSide} />
          <LeverageInput leverage={leverage} onLeverageChange={setLeverage} />
        </div>
        <div className="space-y-4">
          <CalculatorInput
            label="Entry Price"
            value={entryPrice}
            onChange={setEntryPrice}
            placeholder="Enter price in USDC"
            suffix="USDC"
          />
        </div>
      </div>

      <CalculatorOutput
        title="Liquidation Estimate"
        outputs={[
          {
            label: "Liquidation Price",
            value: formatCurrency(liquidationPrice),
            suffix: "USDC",
            colorClass: "text-destructive",
          },
          {
            label: "Distance to Liquidation",
            value: formatPercentage(distanceToLiquidation),
            suffix: "%",
            colorClass: "text-muted-foreground",
          },
        ]}
      />
    </div>
  );
}
