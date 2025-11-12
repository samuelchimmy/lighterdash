import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface AlertHistoryItem {
  id: string;
  marketId: number;
  marketSymbol: string;
  type: "price" | "volume" | "funding";
  message: string;
  timestamp: number;
}

interface AlertHistoryProps {
  history: AlertHistoryItem[];
  onClear: () => void;
  onRemove: (id: string) => void;
}

export function AlertHistory({ history, onClear, onRemove }: AlertHistoryProps) {
  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case "price":
        return "default";
      case "volume":
        return "secondary";
      case "funding":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Alert History
          </CardTitle>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No alerts triggered yet
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.marketSymbol}</span>
                        <Badge variant={getAlertBadgeVariant(item.type)} className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onRemove(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
