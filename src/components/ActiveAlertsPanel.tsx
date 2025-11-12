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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Active Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alertEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No alerts configured yet. Click the bell icon on any market to set up alerts.
          </div>
        ) : (
          <div className="space-y-4">
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
                  className="p-4 rounded-lg border bg-card/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{symbol}</h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(marketId)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onDelete(marketId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {!hasAnyAlert && (
                    <p className="text-sm text-muted-foreground">
                      No alerts enabled for this market
                    </p>
                  )}

                  {/* Price Alert */}
                  {alert.priceThreshold?.enabled && (
                    <div className="flex items-center justify-between py-2 border-t">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="text-xs">
                            Price
                          </Badge>
                          <span className="text-sm">
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
                      />
                    </div>
                  )}

                  {/* Volume Alert */}
                  {alert.volumeSpike?.enabled && (
                    <div className="flex items-center justify-between py-2 border-t">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Volume
                          </Badge>
                          <span className="text-sm">
                            Spike ≥ {alert.volumeSpike.percentageIncrease}%
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={alert.volumeSpike.enabled}
                        onCheckedChange={(enabled) =>
                          onToggleAlert(marketId, "volumeSpike", enabled)
                        }
                      />
                    </div>
                  )}

                  {/* Funding Rate Alert */}
                  {alert.fundingRate?.enabled && (
                    <div className="flex items-center justify-between py-2 border-t">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Funding
                          </Badge>
                          <span className="text-sm">
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
