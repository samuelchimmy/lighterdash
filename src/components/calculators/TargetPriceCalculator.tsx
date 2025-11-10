import { useState } from "react";
import { EnhancedSideToggle } from "./EnhancedSideToggle";
import { EnhancedLeverageInput } from "./EnhancedLeverageInput";
import { EnhancedCalculatorInput } from "./EnhancedCalculatorInput";
import { ResultsDisplay } from "./ResultsDisplay";
import { Button } from "@/components/ui/button";
import {
  calculateTargetPrice,
  formatCurrency,
  parseNumberInput,
  Side,
} from "@/lib/calculator-utils";
import type { Market } from "./AssetSelector";

interface TargetPriceCalculatorProps {
  selectedMarket: Market;
}

export function TargetPriceCalculator({ selectedMarket }: TargetPriceCalculatorProps) {
  const [side, setSide] = useState<Side>('long');
  const [leverage, setLeverage] = useState(10);
  const [entryPrice, setEntryPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [roePercent, setRoePercent] = useState('');
  const [targetPrice, setTargetPrice] = useState('--');

  const handleCalculate = () => {
    const entry = parseNumberInput(entryPrice);
    const qty = parseNumberInput(quantity);
    const roe = parseNumberInput(roePercent);

    if (entry > 0 && qty > 0 && leverage > 0) {
      const target = calculateTargetPrice(side, entry, qty, leverage, roe);
      setTargetPrice(formatCurrency(target) + ' USDT');
    } else {
      setTargetPrice('--');
    }
  };

  return (
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
        
        <EnhancedCalculatorInput
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          suffix={selectedMarket.baseAsset}
        />
        
        <EnhancedCalculatorInput
          label="Desired ROE %"
          value={roePercent}
          onChange={setRoePercent}
          suffix="%"
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
            label: "Target Price",
            value: targetPrice,
            colorClass: "text-primary",
          },
        ]}
      />
    </div>
  );
}
