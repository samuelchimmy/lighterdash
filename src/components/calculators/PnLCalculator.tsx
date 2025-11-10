import { useState } from "react";
import { EnhancedSideToggle } from "./EnhancedSideToggle";
import { EnhancedLeverageInput } from "./EnhancedLeverageInput";
import { EnhancedCalculatorInput } from "./EnhancedCalculatorInput";
import { ResultsDisplay } from "./ResultsDisplay";
import { Button } from "@/components/ui/button";
import {
  calculatePnL,
  calculateROE,
  calculateInitialMargin,
  formatCurrency,
  parseNumberInput,
  Side,
} from "@/lib/calculator-utils";
import type { Market } from "./AssetSelector";

interface PnLCalculatorProps {
  selectedMarket: Market;
}

export function PnLCalculator({ selectedMarket }: PnLCalculatorProps) {
  const [side, setSide] = useState<Side>('long');
  const [leverage, setLeverage] = useState(10);
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  
  const [initialMargin, setInitialMargin] = useState('--');
  const [pnl, setPnl] = useState('--');
  const [roe, setRoe] = useState('--');

  const handleCalculate = () => {
    const entry = parseNumberInput(entryPrice);
    const exit = parseNumberInput(exitPrice);
    const qty = parseNumberInput(quantity);

    if (entry > 0 && exit > 0 && qty > 0 && leverage > 0) {
      const margin = calculateInitialMargin(qty, entry, leverage);
      const calculatedPnl = calculatePnL(side, entry, exit, qty);
      const calculatedRoe = calculateROE(calculatedPnl, margin);

      setInitialMargin(formatCurrency(margin) + ' USDT');
      setPnl(formatCurrency(calculatedPnl) + ' USDT');
      setRoe(calculatedRoe.toFixed(2) + '%');
    } else {
      setInitialMargin('--');
      setPnl('--');
      setRoe('--');
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
          label="Exit Price"
          value={exitPrice}
          onChange={setExitPrice}
          suffix="USDT"
        />
        
        <EnhancedCalculatorInput
          label="Quantity"
          value={quantity}
          onChange={setQuantity}
          suffix={selectedMarket.baseAsset}
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
            label: "Initial Margin",
            value: initialMargin,
          },
          {
            label: "PnL",
            value: pnl,
            colorClass: pnl.includes('-') ? 'text-loss' : pnl === '--' ? '' : 'text-profit',
          },
          {
            label: "ROI",
            value: roe,
            colorClass: roe.includes('-') ? 'text-loss' : roe === '--' ? '' : 'text-profit',
          },
        ]}
      />
    </div>
  );
}
