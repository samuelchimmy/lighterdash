import { useState } from 'react';
import { WalletInput } from '@/components/WalletInput';
import { Dashboard } from '@/components/Dashboard';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { ScanningLoader } from '@/components/ScanningLoader';
import { DonationModal } from '@/components/DonationModal';
import { Button } from '@/components/ui/button';
import { BarChart3, Zap, Wallet, Copy, Check, GitCompare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [scannedAddress, setScannedAddress] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date>();
  const [copied, setCopied] = useState(false);

  const donationAddress = '0xfa2B8eD012f756E22E780B772d604af4575d5fcf';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(donationAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectionChange = (status: 'connected' | 'disconnected' | 'reconnecting') => {
    setConnectionStatus(status);
    if (status === 'connected') {
      setLastUpdate(new Date());
    }
  };

  const handleScan = async (address: string) => {
    setIsScanning(true);
    // Simulate a realistic delay for scanning and data fetching (1.5-2 seconds)
    setTimeout(() => {
      setScannedAddress(address);
      setIsScanning(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-background">
      <DonationModal />
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 glow-primary rounded-lg" />
                <BarChart3 className="w-8 h-8 text-primary relative" />
              </div>
              <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                LighterDash
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {scannedAddress && (
                <ConnectionStatus status={connectionStatus} lastUpdate={lastUpdate} />
              )}
              {!scannedAddress && (
                <>
                  <Button
                    onClick={() => navigate('/community')}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <GitCompare className="w-4 h-4" />
                    <span className="hidden md:inline">Compare Wallets</span>
                  </Button>
                  <Button
                    onClick={() => navigate('/analytics')}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden md:inline">Analytics</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isScanning ? (
          <ScanningLoader />
        ) : !scannedAddress ? (
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
                Track Your Lighter Trading
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Community-built analytics dashboard for Lighter. View real-time trading statistics,
                track your performance, and analyze your trading data.
              </p>
            </div>

            {/* Wallet Input */}
            <div className="mb-12">
              <WalletInput onScan={handleScan} isLoading={isScanning} />
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in">
              <div className="group bg-gradient-to-br from-card/50 to-card border border-border/50 rounded-xl p-6 shadow-card hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base md:text-lg font-medium text-foreground mb-2">Wallet Tracker</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Track any Lighter wallet&apos;s positions, trades, PnL, and performance metrics in real-time.
                </p>
              </div>

              <div className="group bg-gradient-to-br from-card/50 to-card border border-border/50 rounded-xl p-6 shadow-card hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base md:text-lg font-medium text-foreground mb-2">Market Analytics</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  View live order books, recent trades, funding rates, and comprehensive market statistics.
                </p>
              </div>

              <div className="group bg-gradient-to-br from-card/50 to-card border border-border/50 rounded-xl p-6 shadow-card hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base md:text-lg font-medium text-foreground mb-2">Real-Time Updates</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  WebSocket-powered live data streams for instant market and account updates.
                </p>
              </div>
            </div>

            {/* Detailed Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="group relative bg-gradient-to-br from-card/80 via-card/60 to-card/40 border border-border/50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-xl" />
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-6 flex items-center gap-3 group-hover:text-primary transition-colors duration-300">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-110 transition-transform duration-300">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    Wallet Analytics
                  </h3>
                  <ul className="space-y-4 text-muted-foreground">
                    <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-sm leading-relaxed">Track total PnL, unrealized and realized gains across all positions</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '50ms' }}>
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-sm leading-relaxed">Monitor portfolio value, leverage, and margin usage in real-time</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '100ms' }}>
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-sm leading-relaxed">View detailed position breakdowns by asset with entry prices and liquidation levels</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '150ms' }}>
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-sm leading-relaxed">Analyze complete trade history with fees, duration, and profitability metrics</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '200ms' }}>
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-sm leading-relaxed">Compare multiple wallets side-by-side to analyze performance differences</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '250ms' }}>
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-purple-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-sm leading-relaxed">Export trading data and performance reports for external analysis</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="group relative bg-gradient-to-br from-card/80 via-card/60 to-card/40 border border-border/50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-primary/20 blur-xl" />
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-6 flex items-center gap-3 group-hover:text-primary transition-colors duration-300">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 group-hover:scale-110 transition-transform duration-300">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    Advanced Features
                  </h3>
                  <ul className="space-y-4 text-muted-foreground">
                    <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-sm leading-relaxed">AI-powered pattern recognition to identify winning and losing trade setups</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '50ms' }}>
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-sm leading-relaxed">Win/loss streak analysis with performance breakdown by time and market</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '100ms' }}>
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-sm leading-relaxed">Trading journal with custom notes and tags for every trade</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '150ms' }}>
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-sm leading-relaxed">Liquidation risk monitoring with real-time alerts and position health tracking</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '200ms' }}>
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-sm leading-relaxed">Live market data including order book depth, recent trades, and funding rates</span>
                    </li>
                    <li className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: '250ms' }}>
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-sm leading-relaxed">Performance metrics by asset, time, and trading strategy with visual charts</span>
                    </li>
                  </ul>
                </div>
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
        <div className="container mx-auto px-4 py-6 space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            Built with 💜 by{' '}
            <a
              href="https://x.com/MetisCharter"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-glow transition-colors font-medium"
            >
              Jadeofwallstreet
            </a>
          </p>
          <div className="flex flex-col items-center gap-2">
            <p className="text-center text-sm text-muted-foreground">
              Donate to keep us running:
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs md:text-sm font-mono text-purple-500 glow-purple break-all">
                {donationAddress}
              </code>
              <button
                onClick={copyToClipboard}
                className="p-1 hover:bg-accent rounded transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Community-built analytics for Lighter • Not affiliated with Lighter
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
