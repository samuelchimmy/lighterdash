import { useState } from "react";
import { EnhancedLeverageInput } from "./EnhancedLeverageInput";
import { EnhancedCalculatorInput } from "./EnhancedCalculatorInput";
import { ResultsDisplay } from "./ResultsDisplay";
import { Button } from "@/components/ui/button";
import { parseNumberInput, formatCurrency } from "@/lib/calculator-utils";
import type { Market } from "./AssetSelector";

interface MaxOpenCalculatorProps {
  selectedMarket: Market;
}

export function MaxOpenCalculator({ selectedMarket }: MaxOpenCalculatorProps) {
  const [leverage, setLeverage] = useState(10);
  const [availableBalance, setAvailableBalance] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [maxOpen, setMaxOpen] = useState('--');

  const handleCalculate = () => {
    const balance = parseNumberInput(availableBalance);
    const entry = parseNumberInput(entryPrice);

    if (balance > 0 && entry > 0 && leverage > 0) {
      const result = (balance * leverage) / entry;
      setMaxOpen(formatCurrency(result));
    } else {
      setMaxOpen('--');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <EnhancedLeverageInput leverage={leverage} onLeverageChange={setLeverage} />
        
        <EnhancedCalculatorInput
          label="Available Balance"
          value={availableBalance}
          onChange={setAvailableBalance}
          suffix="USDT"
        />
        
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
            label: "Max Open",
            value: `${maxOpen} ${selectedMarket.baseAsset}`,
          },
        ]}
      />
    </div>
  );
}
