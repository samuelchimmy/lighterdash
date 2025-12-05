import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Edit, Trash2 } from "lucide-react";
import { MarketAlert } from "./MarketAlertDialog";

interface ActiveAlertsPanelProps {
  alerts: Record<number, MarketAlert>;
  getMarketSymbol: (marketId: number) => string;
  onEdit: (marketId: number) => void;
  onDelete: (marketId: number) => void;
  onToggleAlert: (marketId: number, alertType: keyof MarketAlert, enabled: boolean) => void;
}

export function ActiveAlertsPanel({
  alerts,
  getMarketSymbol,
  onEdit,
  onDelete,
  onToggleAlert,
}: ActiveAlertsPanelProps) {
  const alertEntries = Object.entries(alerts);

  return (
    <Card className="border-border/30 bg-secondary/10">
      <CardHeader className="py-2 px-3">
        <CardTitle className="flex items-center gap-1.5 text-xs">
          <Bell className="h-3 w-3 text-primary" />
          Active Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {alertEntries.length === 0 ? (
          <div className="text-center py-4 text-[10px] text-muted-foreground">
            No alerts configured yet. Click the bell icon on any market to set up alerts.
          </div>
        ) : (
          <div className="space-y-2">
            {alertEntries.map(([marketIdStr, alert]) => {
              const marketId = parseInt(marketIdStr);
              const symbol = getMarketSymbol(marketId);
              const hasAnyAlert =
                alert.priceThreshold?.enabled ||
                alert.volumeSpike?.enabled ||
                alert.fundingRate?.enabled;

              return (
                <div
                  key={marketId}
                  className="p-2 rounded-lg border border-border/30 bg-secondary/20 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xs">{symbol}</h3>
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => onEdit(marketId)}
                      >
                        <Edit className="h-2.5 w-2.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => onDelete(marketId)}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>

                  {!hasAnyAlert && (
                    <p className="text-[9px] text-muted-foreground">
                      No alerts enabled for this market
                    </p>
                  )}

                  {/* Price Alert */}
                  {alert.priceThreshold?.enabled && (
                    <div className="flex items-center justify-between py-1 border-t border-border/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <Badge variant="default" className="text-[8px] h-3.5 px-1">
                            Price
                          </Badge>
                          <span className="text-[9px]">
                            {alert.priceThreshold.above &&
                              `Above $${alert.priceThreshold.above.toLocaleString()}`}
                            {alert.priceThreshold.above && alert.priceThreshold.below && " · "}
                            {alert.priceThreshold.below &&
                              `Below $${alert.priceThreshold.below.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={alert.priceThreshold.enabled}
                        onCheckedChange={(enabled) =>
                          onToggleAlert(marketId, "priceThreshold", enabled)
                        }
                        className="scale-75"
                      />
                    </div>
                  )}

                  {/* Volume Alert */}
                  {alert.volumeSpike?.enabled && (
                    <div className="flex items-center justify-between py-1 border-t border-border/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[8px] h-3.5 px-1">
                            Volume
                          </Badge>
                          <span className="text-[9px]">
                            Spike ≥ {alert.volumeSpike.percentageIncrease}%
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={alert.volumeSpike.enabled}
                        onCheckedChange={(enabled) =>
                          onToggleAlert(marketId, "volumeSpike", enabled)
                        }
                        className="scale-75"
                      />
                    </div>
                  )}

                  {/* Funding Rate Alert */}
                  {alert.fundingRate?.enabled && (
                    <div className="flex items-center justify-between py-1 border-t border-border/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[8px] h-3.5 px-1">
                            Funding
                          </Badge>
                          <span className="text-[9px]">
                            {alert.fundingRate.above && `Above ${alert.fundingRate.above}%`}
                            {alert.fundingRate.above && alert.fundingRate.below && " · "}
                            {alert.fundingRate.below && `Below ${alert.fundingRate.below}%`}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={alert.fundingRate.enabled}
                        onCheckedChange={(enabled) =>
                          onToggleAlert(marketId, "fundingRate", enabled)
                        }
                        className="scale-75"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}