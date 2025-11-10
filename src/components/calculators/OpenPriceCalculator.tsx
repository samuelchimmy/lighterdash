import { useState } from "react";
import { EnhancedCalculatorInput } from "./EnhancedCalculatorInput";
import { ResultsDisplay } from "./ResultsDisplay";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { parseNumberInput, formatCurrency } from "@/lib/calculator-utils";
import type { Market } from "./AssetSelector";

interface Entry {
  id: number;
  price: string;
  quantity: string;
}

interface OpenPriceCalculatorProps {
  selectedMarket: Market;
}

export function OpenPriceCalculator({ selectedMarket }: OpenPriceCalculatorProps) {
  const [entries, setEntries] = useState<Entry[]>([
    { id: 1, price: '', quantity: '' }
  ]);
  const [totalQuantity, setTotalQuantity] = useState('--');
  const [averagePrice, setAveragePrice] = useState('--');

  const addEntry = () => {
    const newId = Math.max(...entries.map(e => e.id), 0) + 1;
    setEntries([...entries, { id: newId, price: '', quantity: '' }]);
  };

  const removeEntry = (id: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const updateEntry = (id: number, field: 'price' | 'quantity', value: string) => {
    setEntries(entries.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const handleCalculate = () => {
    let totalCost = 0;
    let totalQty = 0;

    entries.forEach(entry => {
      const price = parseNumberInput(entry.price);
      const qty = parseNumberInput(entry.quantity);
      totalCost += price * qty;
      totalQty += qty;
    });

    if (totalQty > 0) {
      setTotalQuantity(formatCurrency(totalQty));
      setAveragePrice(formatCurrency(totalCost / totalQty));
    } else {
      setTotalQuantity('--');
      setAveragePrice('--');
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={entry.id} className="space-y-3 p-4 rounded-lg border border-border/50 bg-card/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Entry {index + 1}</span>
              {entries.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeEntry(entry.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
            <EnhancedCalculatorInput
              label="Entry Price"
              value={entry.price}
              onChange={(value) => updateEntry(entry.id, 'price', value)}
              suffix="USDT"
            />
            <EnhancedCalculatorInput
              label="Quantity"
              value={entry.quantity}
              onChange={(value) => updateEntry(entry.id, 'quantity', value)}
              suffix={selectedMarket.baseAsset}
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addEntry}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>

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
            label: "Total Quantity",
            value: `${totalQuantity} ${selectedMarket.baseAsset}`,
          },
          {
            label: "Average Entry Price",
            value: `${averagePrice} USDT`,
          },
        ]}
      />
    </div>
  );
}
