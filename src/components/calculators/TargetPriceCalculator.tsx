import { useState, useEffect } from "react";
import { SideToggle } from "./SideToggle";
import { LeverageInput } from "./LeverageInput";
import { CalculatorInput } from "./CalculatorInput";
import { CalculatorOutput } from "./CalculatorOutput";
import {
  calculateTargetPrice,
  formatCurrency,
  formatPercentage,
  parseNumberInput,
  getPnLColorClass,
  Side,
} from "@/lib/calculator-utils";

export function TargetPriceCalculator() {
  const [side, setSide] = useState<Side>('long');
  const [leverage, setLeverage] = useState(10);
  const [entryPrice, setEntryPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [roePercent, setRoePercent] = useState('');

  const [targetPrice, setTargetPrice] = useState(0);
  const [priceMovement, setPriceMovement] = useState(0);
  const [priceMovementPercent, setPriceMovementPercent] = useState(0);

  useEffect(() => {
    const entry = parseNumberInput(entryPrice);
    const qty = parseNumberInput(quantity);
    const roe = parseNumberInput(roePercent);

    if (entry > 0 && qty > 0 && leverage > 0) {
      const target = calculateTargetPrice(side, entry, qty, leverage, roe);
      setTargetPrice(target);

      const movement = target - entry;
      const movementPercent = (movement / entry) * 100;
      setPriceMovement(movement);
      setPriceMovementPercent(movementPercent);
    } else {
      setTargetPrice(0);
      setPriceMovement(0);
      setPriceMovementPercent(0);
    }
  }, [side, leverage, entryPrice, quantity, roePercent]);

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
            label="Quantity"
            value={quantity}
            onChange={setQuantity}
            placeholder="Enter position size"
            helpText="Size in base asset (e.g., BTC, ETH)"
          />
          <CalculatorInput
            label="Desired ROE"
            value={roePercent}
            onChange={setRoePercent}
            placeholder="Enter target ROE"
            suffix="%"
            helpText="Target return on equity percentage"
          />
        </div>
      </div>

      <CalculatorOutput
        title="Target Price Analysis"
        outputs={[
          {
            label: "Target Price",
            value: formatCurrency(targetPrice),
            suffix: "USDC",
            colorClass: getPnLColorClass(parseNumberInput(roePercent)),
          },
          {
            label: "Price Movement Needed",
            value: formatCurrency(Math.abs(priceMovement)),
            suffix: "USDC",
            colorClass: "text-muted-foreground",
          },
          {
            label: "Movement %",
            value: formatPercentage(Math.abs(priceMovementPercent)),
            suffix: "%",
            colorClass: "text-muted-foreground",
          },
        ]}
      />
    </div>
  );
}
