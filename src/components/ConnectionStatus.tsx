import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'reconnecting';
  lastUpdate?: Date;
  onReconnect?: () => void;
}

export const ConnectionStatus = ({ status, lastUpdate, onReconnect }: ConnectionStatusProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="w-3 h-3" />,
          variant: 'default' as const,
          text: 'Live',
          color: 'text-profit',
        };
      case 'reconnecting':
        return {
          icon: <RefreshCw className="w-3 h-3 animate-spin" />,
          variant: 'secondary' as const,
          text: 'Reconnecting',
          color: 'text-muted-foreground',
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-3 h-3" />,
          variant: 'destructive' as const,
          text: 'Offline',
          color: 'text-loss',
        };
    }
  };

  const config = getStatusConfig();

  const handleClick = () => {
    if (status === 'disconnected' && onReconnect) {
      onReconnect();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={config.variant} 
            className={`gap-1.5 hover-glow-badge transition-all ${
              status === 'disconnected' && onReconnect 
                ? 'cursor-pointer hover:scale-105 active:scale-95' 
                : 'cursor-help'
            }`}
            onClick={handleClick}
          >
            {config.icon}
            {config.text}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">WebSocket Connection</p>
            <p className="text-xs text-muted-foreground">
              Status: <span className={config.color}>{status}</span>
            </p>
            {lastUpdate && (
              <p className="text-xs text-muted-foreground">
                Last update: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
            {status === 'disconnected' && onReconnect && (
              <p className="text-xs text-primary font-medium mt-2">
                Click to reconnect
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
