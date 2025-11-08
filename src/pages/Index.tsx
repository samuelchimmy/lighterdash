import { useState } from 'react';
import { WalletInput } from '@/components/WalletInput';
import { Dashboard } from '@/components/Dashboard';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { BarChart3, Zap } from 'lucide-react';

const Index = () => {
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date>();

  const handleConnectionChange = (status: 'connected' | 'disconnected' | 'reconnecting') => {
    setConnectionStatus(status);
    if (status === 'connected') {
      setLastUpdate(new Date());
    }
  };

  const handleScan = async (address: string) => {
    setIsScanning(true);
    // Simulate a brief delay for UX
    setTimeout(() => {
      setScannedAddress(address);
      setIsScanning(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 glow-primary rounded-lg" />
                <BarChart3 className="w-8 h-8 text-primary relative" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                LighterDash
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {scannedAddress && (
                <ConnectionStatus status={connectionStatus} lastUpdate={lastUpdate} />
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-primary" />
                <span>Real-time Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!scannedAddress ? (
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-block mb-4">
                <div className="relative">
                  <div className="absolute inset-0 gradient-primary blur-xl opacity-50" />
                  <div className="relative bg-card border border-border rounded-2xl p-6">
                    <BarChart3 className="w-16 h-16 text-primary mx-auto" />
                  </div>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Track Your Lighter Trading
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Community-built analytics dashboard for Lighter. View real-time trading statistics,
                track your performance, and analyze your trading data.
              </p>
            </div>

            {/* Wallet Input */}
            <div className="mb-12">
              <WalletInput onScan={handleScan} isLoading={isScanning} />
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Real-Time Data</h3>
                <p className="text-muted-foreground text-sm">
                  Live WebSocket connection to Lighter for instant updates on positions, trades, and account stats.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground text-sm">
                  Comprehensive trading metrics including PnL breakdowns, winrate, and performance by asset.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Mobile Responsive</h3>
                <p className="text-muted-foreground text-sm">
                  Access your trading dashboard anywhere with a fully responsive design optimized for all devices.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setScannedAddress(null)}
              className="mb-6 text-primary hover:text-primary-glow transition-colors flex items-center gap-2"
            >
              ← Scan another wallet
            </button>
            <Dashboard walletAddress={scannedAddress} onConnectionStatusChange={handleConnectionChange} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Community-built analytics for Lighter • Not affiliated with Lighter
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
