import { useState, useEffect } from "react";
import { SideToggle } from "./SideToggle";
import { LeverageInput } from "./LeverageInput";
import { CalculatorInput } from "./CalculatorInput";
import { CalculatorOutput } from "./CalculatorOutput";
import {
  calculateInitialMargin,
  calculatePnL,
  calculateROE,
  formatCurrency,
  formatPercentage,
  parseNumberInput,
  getPnLColorClass,
  Side,
} from "@/lib/calculator-utils";

export function PnLCalculator() {
  const [side, setSide] = useState<Side>('long');
  const [leverage, setLeverage] = useState(10);
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const [initialMargin, setInitialMargin] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [roe, setRoe] = useState(0);

  useEffect(() => {
    const entry = parseNumberInput(entryPrice);
    const exit = parseNumberInput(exitPrice);
    const qty = parseNumberInput(quantity);

    if (entry > 0 && exit > 0 && qty > 0 && leverage > 0) {
      const margin = calculateInitialMargin(qty, entry, leverage);
      const profitLoss = calculatePnL(side, entry, exit, qty);
      const returnOnEquity = calculateROE(profitLoss, margin);

      setInitialMargin(margin);
      setPnl(profitLoss);
      setRoe(returnOnEquity);
    } else {
      setInitialMargin(0);
      setPnl(0);
      setRoe(0);
    }
  }, [side, leverage, entryPrice, exitPrice, quantity]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <SideToggle side={side} onSideChange={setSide} />
          <LeverageInput leverage={leverage} onLeverageChange={setLeverage} />
          <CalculatorInput
            label="Entry Price"
            value={entryPrice}
            onChange={setEntryPrice}
            placeholder="Enter price in USDC"
            suffix="USDC"
          />
        </div>
        <div className="space-y-4">
          <CalculatorInput
            label="Exit Price"
            value={exitPrice}
            onChange={setExitPrice}
            placeholder="Enter price in USDC"
            suffix="USDC"
          />
          <CalculatorInput
            label="Quantity"
            value={quantity}
            onChange={setQuantity}
            placeholder="Enter position size"
            helpText="Size in base asset (e.g., BTC, ETH)"
          />
        </div>
      </div>

      <CalculatorOutput
        title="Calculation Results"
        outputs={[
          {
            label: "Initial Margin",
            value: formatCurrency(initialMargin),
            suffix: "USDC",
          },
          {
            label: "PnL",
            value: formatCurrency(pnl),
            suffix: "USDC",
            colorClass: getPnLColorClass(pnl),
          },
          {
            label: "ROE",
            value: formatPercentage(roe),
            suffix: "%",
            colorClass: getPnLColorClass(roe),
          },
        ]}
      />
    </div>
  );
}
