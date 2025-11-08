import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ShieldCheck, AlertOctagon } from "lucide-react";
import { Position } from "@/types/lighter";
import { formatCurrency, formatPercentage } from "@/lib/lighter-api";

interface LiquidationMonitorProps {
  positions: Position[];
  accountValue: number;
}

export function LiquidationMonitor({ positions, accountValue }: LiquidationMonitorProps) {
  const riskAnalysis = useMemo(() => {
    if (positions.length === 0) {
      return {
        overallRisk: 0,
        riskLevel: 'safe' as const,
        atRiskPositions: [] as Array<Position & { distanceToLiq: number; riskPercent: number }>,
      };
    }

    const positionsWithRisk = positions
      .map(position => {
        const currentPrice = parseFloat(position.position_value || '0') / Math.abs(parseFloat(position.position || '1'));
        const liqPrice = parseFloat(position.liquidation_price || '0');
        const size = parseFloat(position.position || '0');
        
        if (liqPrice === 0 || size === 0) {
          return { ...position, distanceToLiq: 100, riskPercent: 0 };
        }

        // Calculate distance to liquidation as a percentage
        const isLong = size > 0;
        const distanceToLiq = isLong 
          ? ((currentPrice - liqPrice) / currentPrice) * 100
          : ((liqPrice - currentPrice) / currentPrice) * 100;

        const riskPercent = Math.max(0, 100 - distanceToLiq);

        return { ...position, distanceToLiq, riskPercent };
      })
      .sort((a, b) => b.riskPercent - a.riskPercent);

    const highestRisk = positionsWithRisk[0]?.riskPercent || 0;
    const avgRisk = positionsWithRisk.reduce((sum, p) => sum + p.riskPercent, 0) / positionsWithRisk.length;

    const riskLevel = 
      highestRisk > 70 ? 'critical' :
      highestRisk > 40 ? 'warning' :
      'safe';

    return {
      overallRisk: avgRisk,
      riskLevel,
      atRiskPositions: positionsWithRisk.filter(p => p.riskPercent > 20),
    };
  }, [positions]);

  const getRiskColor = (risk: number) => {
    if (risk > 70) return 'text-red-500';
    if (risk > 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskIcon = () => {
    if (riskAnalysis.riskLevel === 'critical') return <AlertOctagon className="h-5 w-5 text-red-500" />;
    if (riskAnalysis.riskLevel === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <ShieldCheck className="h-5 w-5 text-green-500" />;
  };

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Liquidation Risk Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No open positions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getRiskIcon()}
          Liquidation Risk Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Risk Gauge */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Portfolio Risk</span>
            <Badge variant={
              riskAnalysis.riskLevel === 'critical' ? 'destructive' :
              riskAnalysis.riskLevel === 'warning' ? 'default' :
              'secondary'
            }>
              {riskAnalysis.riskLevel.toUpperCase()}
            </Badge>
          </div>
          <div className="relative">
            <Progress 
              value={riskAnalysis.overallRisk} 
              className="h-3"
            />
            <span className={`absolute right-2 top-0 text-xs font-bold ${getRiskColor(riskAnalysis.overallRisk)}`}>
              {riskAnalysis.overallRisk.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Average distance to liquidation across all positions
          </p>
        </div>

        {/* At-Risk Positions */}
        {riskAnalysis.atRiskPositions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Positions Requiring Attention</h4>
            <div className="space-y-3">
              {riskAnalysis.atRiskPositions.map((position, idx) => {
                const size = parseFloat(position.position || '0');
                const side = size > 0 ? 'LONG' : 'SHORT';
                
                return (
                  <div 
                    key={idx}
                    className="p-3 rounded-lg border bg-card/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{position.symbol}</span>
                        <Badge variant={side === 'LONG' ? 'default' : 'destructive'} className="text-xs">
                          {side}
                        </Badge>
                      </div>
                      <span className={`text-sm font-bold ${getRiskColor(position.riskPercent)}`}>
                        {position.riskPercent.toFixed(1)}% Risk
                      </span>
                    </div>
                    
                    <div className="relative">
                      <Progress 
                        value={position.riskPercent} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Liq. Price: {formatCurrency(parseFloat(position.liquidation_price || '0'))}</span>
                      <span>Distance: {formatPercentage(position.distanceToLiq)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Safe Positions Summary */}
        {riskAnalysis.atRiskPositions.length === 0 && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <ShieldCheck className="h-6 w-6 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-500">All Positions Safe</p>
              <p className="text-xs text-muted-foreground">
                All positions have healthy distance to liquidation
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
