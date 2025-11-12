import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";

export interface MarketAlert {
  marketId: number;
  priceThreshold?: {
    enabled: boolean;
    above?: number;
    below?: number;
  };
  volumeSpike?: {
    enabled: boolean;
    percentageIncrease: number;
  };
  fundingRate?: {
    enabled: boolean;
    above?: number;
    below?: number;
  };
}

interface MarketAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketId: number;
  marketSymbol: string;
  currentPrice: number;
  currentFundingRate: number;
  alert?: MarketAlert;
  onSave: (alert: MarketAlert) => void;
}

export function MarketAlertDialog({
  open,
  onOpenChange,
  marketId,
  marketSymbol,
  currentPrice,
  currentFundingRate,
  alert,
  onSave,
}: MarketAlertDialogProps) {
  const [priceEnabled, setPriceEnabled] = useState(alert?.priceThreshold?.enabled ?? false);
  const [priceAbove, setPriceAbove] = useState(alert?.priceThreshold?.above?.toString() ?? "");
  const [priceBelow, setPriceBelow] = useState(alert?.priceThreshold?.below?.toString() ?? "");
  
  const [volumeEnabled, setVolumeEnabled] = useState(alert?.volumeSpike?.enabled ?? false);
  const [volumePercentage, setVolumePercentage] = useState(
    alert?.volumeSpike?.percentageIncrease?.toString() ?? "50"
  );
  
  const [fundingEnabled, setFundingEnabled] = useState(alert?.fundingRate?.enabled ?? false);
  const [fundingAbove, setFundingAbove] = useState(alert?.fundingRate?.above?.toString() ?? "");
  const [fundingBelow, setFundingBelow] = useState(alert?.fundingRate?.below?.toString() ?? "");

  const handleSave = () => {
    const newAlert: MarketAlert = {
      marketId,
      priceThreshold: {
        enabled: priceEnabled,
        above: priceAbove ? parseFloat(priceAbove) : undefined,
        below: priceBelow ? parseFloat(priceBelow) : undefined,
      },
      volumeSpike: {
        enabled: volumeEnabled,
        percentageIncrease: parseFloat(volumePercentage),
      },
      fundingRate: {
        enabled: fundingEnabled,
        above: fundingAbove ? parseFloat(fundingAbove) : undefined,
        below: fundingBelow ? parseFloat(fundingBelow) : undefined,
      },
    };
    onSave(newAlert);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Settings for {marketSymbol}
          </DialogTitle>
          <DialogDescription>
            Configure custom alerts for price, volume, and funding rate changes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Price Threshold Alerts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="price-alert" className="text-base font-semibold">
                Price Alert
              </Label>
              <Switch
                id="price-alert"
                checked={priceEnabled}
                onCheckedChange={setPriceEnabled}
              />
            </div>
            {priceEnabled && (
              <div className="space-y-2 pl-4">
                <div className="text-xs text-muted-foreground">
                  Current: ${currentPrice.toLocaleString()}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="price-above" className="text-xs">Above</Label>
                    <Input
                      id="price-above"
                      type="number"
                      placeholder="Price"
                      value={priceAbove}
                      onChange={(e) => setPriceAbove(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price-below" className="text-xs">Below</Label>
                    <Input
                      id="price-below"
                      type="number"
                      placeholder="Price"
                      value={priceBelow}
                      onChange={(e) => setPriceBelow(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Volume Spike Alert */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="volume-alert" className="text-base font-semibold">
                Volume Spike Alert
              </Label>
              <Switch
                id="volume-alert"
                checked={volumeEnabled}
                onCheckedChange={setVolumeEnabled}
              />
            </div>
            {volumeEnabled && (
              <div className="space-y-2 pl-4">
                <Label htmlFor="volume-percentage" className="text-xs">
                  Alert when volume increases by
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="volume-percentage"
                    type="number"
                    value={volumePercentage}
                    onChange={(e) => setVolumePercentage(e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-sm">%</span>
                </div>
              </div>
            )}
          </div>

          {/* Funding Rate Alert */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="funding-alert" className="text-base font-semibold">
                Funding Rate Alert
              </Label>
              <Switch
                id="funding-alert"
                checked={fundingEnabled}
                onCheckedChange={setFundingEnabled}
              />
            </div>
            {fundingEnabled && (
              <div className="space-y-2 pl-4">
                <div className="text-xs text-muted-foreground">
                  Current: {(currentFundingRate * 100).toFixed(4)}%
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="funding-above" className="text-xs">Above (%)</Label>
                    <Input
                      id="funding-above"
                      type="number"
                      step="0.01"
                      placeholder="0.5"
                      value={fundingAbove}
                      onChange={(e) => setFundingAbove(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="funding-below" className="text-xs">Below (%)</Label>
                    <Input
                      id="funding-below"
                      type="number"
                      step="0.01"
                      placeholder="-0.5"
                      value={fundingBelow}
                      onChange={(e) => setFundingBelow(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Alerts</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
