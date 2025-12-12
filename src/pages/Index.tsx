import { useState, useEffect, useRef } from 'react';
import { WalletInput } from '@/components/WalletInput';
import { Dashboard } from '@/components/Dashboard';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { ScanningLoader } from '@/components/ScanningLoader';
import { DonationModal } from '@/components/DonationModal';
import { ReferralPromoModal } from '@/components/ReferralPromoModal';
import { RealtimeLiquidationMonitor } from '@/components/RealtimeLiquidationMonitor';
import { Layout } from '@/components/Layout';
import { FeatureAnnouncement } from '@/components/FeatureAnnouncement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletIcon, ChartBarIcon, SignalIcon, CpuChipIcon, LightBulbIcon } from '@heroicons/react/24/solid';
import { useSearchParams } from 'react-router-dom';

const TITLE_TEXT = "LighterDash";

// Animated Chart Background Component - for Hero section only
const AnimatedChartBackground = () => {
  const baseline = 160;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg className="w-full h-full opacity-60" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice">
        {/* Animated chart lines */}
        <path className="chart-line chart-line-1" d="M0,80 Q50,60 100,70 T200,50 T300,65 T400,45" />
        <path className="chart-line chart-line-2" d="M0,120 Q50,100 100,110 T200,90 T300,105 T400,85" />
        <path className="chart-line chart-line-3" d="M0,160 Q50,140 100,150 T200,130 T300,145 T400,125" />
        
        {/* Grid lines */}
        <line x1="0" y1="50" x2="400" y2="50" stroke="hsl(var(--primary) / 0.05)" strokeDasharray="4 4" />
        <line x1="0" y1="100" x2="400" y2="100" stroke="hsl(var(--primary) / 0.05)" strokeDasharray="4 4" />
        
        {/* Baseline floor - nearly invisible */}
        <line x1="10" y1={baseline} x2="390" y2={baseline} stroke="hsl(var(--primary) / 0.02)" strokeWidth="1" />
        
        {/* Animated candlesticks - all bottoms aligned to baseline */}
        <rect className="chart-candle chart-candle-green" x="30" y={baseline - 40} width="8" height="40" rx="1" style={{ animationDelay: '0s' }} />
        <rect className="chart-candle chart-candle-red" x="50" y={baseline - 30} width="8" height="30" rx="1" style={{ animationDelay: '0.5s' }} />
        <rect className="chart-candle chart-candle-green" x="70" y={baseline - 50} width="8" height="50" rx="1" style={{ animationDelay: '1s' }} />
        <rect className="chart-candle chart-candle-green" x="90" y={baseline - 35} width="8" height="35" rx="1" style={{ animationDelay: '1.5s' }} />
        <rect className="chart-candle chart-candle-red" x="110" y={baseline - 25} width="8" height="25" rx="1" style={{ animationDelay: '2s' }} />
        
        <rect className="chart-candle chart-candle-green" x="150" y={baseline - 45} width="8" height="45" rx="1" style={{ animationDelay: '0.3s' }} />
        <rect className="chart-candle chart-candle-red" x="170" y={baseline - 35} width="8" height="35" rx="1" style={{ animationDelay: '0.8s' }} />
        <rect className="chart-candle chart-candle-green" x="190" y={baseline - 55} width="8" height="55" rx="1" style={{ animationDelay: '1.3s' }} />
        <rect className="chart-candle chart-candle-red" x="210" y={baseline - 30} width="8" height="30" rx="1" style={{ animationDelay: '1.8s' }} />
        
        <rect className="chart-candle chart-candle-green" x="250" y={baseline - 50} width="8" height="50" rx="1" style={{ animationDelay: '0.2s' }} />
        <rect className="chart-candle chart-candle-green" x="270" y={baseline - 60} width="8" height="60" rx="1" style={{ animationDelay: '0.7s' }} />
        <rect className="chart-candle chart-candle-red" x="290" y={baseline - 40} width="8" height="40" rx="1" style={{ animationDelay: '1.2s' }} />
        <rect className="chart-candle chart-candle-green" x="310" y={baseline - 55} width="8" height="55" rx="1" style={{ animationDelay: '1.7s' }} />
        <rect className="chart-candle chart-candle-red" x="330" y={baseline - 35} width="8" height="35" rx="1" style={{ animationDelay: '2.2s' }} />
        <rect className="chart-candle chart-candle-green" x="350" y={baseline - 65} width="8" height="65" rx="1" style={{ animationDelay: '2.5s' }} />
        <rect className="chart-candle chart-candle-green" x="370" y={baseline - 70} width="8" height="70" rx="1" style={{ animationDelay: '2.8s' }} />
      </svg>
    </div>
  );
};

// Card Watermark Component
const CardWatermark = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
    <span className="absolute bottom-2 right-3 text-[10px] font-semibold text-primary/[0.07] tracking-wider">
      LighterDash
    </span>
  </div>
);

// Animated Letter Component
const AnimatedLetter = ({ letter, index, shouldAnimate }: { letter: string; index: number; shouldAnimate: boolean }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (shouldAnimate) {
      const timeout = setTimeout(() => {
        setIsAnimating(true);
      }, index * 120); // Stagger each letter by 120ms
      
      return () => clearTimeout(timeout);
    }
  }, [shouldAnimate, index]);
  
  return (
    <span 
      className={`inline-block text-foreground ${isAnimating ? 'animate-letter-zoom' : ''}`}
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      {letter}
    </span>
  );
};

const Index = () => {
  const [titleAnimationStarted, setTitleAnimationStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleReferralClose = () => {
    setTitleAnimationStarted(true);
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const [scannedAddress, setScannedAddress] = useState<string | null>(() => {
    const urlAddress = searchParams.get('wallet');
    const storedAddress = localStorage.getItem('lighterdash-wallet');
    return urlAddress || storedAddress;
  });
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
    setTimeout(() => {
      setScannedAddress(address);
      localStorage.setItem('lighterdash-wallet', address);
      setSearchParams({ wallet: address });
      setIsScanning(false);
    }, 1800);
  };

  useEffect(() => {
    if (scannedAddress) {
      localStorage.setItem('lighterdash-wallet', scannedAddress);
      setSearchParams({ wallet: scannedAddress });
    } else {
      localStorage.removeItem('lighterdash-wallet');
      setSearchParams({});
    }
  }, [scannedAddress, setSearchParams]);

  return (
    <Layout 
      headerContent={
        scannedAddress ? (
          <ConnectionStatus status={connectionStatus} lastUpdate={lastUpdate} />
        ) : null
      }
    >
      <ReferralPromoModal onClose={handleReferralClose} />
      <DonationModal />
      <FeatureAnnouncement />
      <div className="container mx-auto px-4 py-6 max-w-6xl" role="main">
        {isScanning ? (
          <ScanningLoader />
        ) : !scannedAddress ? (
          <div ref={containerRef} className="max-w-4xl mx-auto space-y-5 lg:space-y-6 relative">
            {/* Hero Section with Animated Chart Background */}
            <section className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500 relative overflow-hidden rounded-2xl py-8 px-4">
              {/* Animated Chart Background - contained in Hero only */}
              <AnimatedChartBackground />
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 lg:mb-3 tracking-tight">
                {TITLE_TEXT.split('').map((letter, index) => (
                  <AnimatedLetter 
                    key={index} 
                    letter={letter} 
                    index={index} 
                    shouldAnimate={titleAnimationStarted} 
                  />
                ))}
                <span className="sr-only"> - Lighter Analytics Dashboard</span>
              </h1>
              <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground mb-2 lg:mb-3">
                Lighter Analytics - Track Your Trading Performance
              </h2>
              <p className="text-xs md:text-sm lg:text-base text-muted-foreground max-w-xl lg:max-w-2xl mx-auto">
                Free Lighter analytics dashboard for tracking wallet performance. Real-time PnL, positions, trades, and market data. The best community-built Lighter analytics tool.
              </p>
            </section>

            {/* Wallet Input */}
            <section aria-label="Wallet address input">
              <WalletInput onScan={handleScan} isLoading={isScanning} />
            </section>

            {/* Feature Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '50ms' }} aria-label="Key features">
              <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="py-3 px-4 lg:py-4 lg:px-5">
                  <CardTitle className="flex items-center gap-2 text-xs lg:text-sm">
                    <WalletIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" aria-hidden="true" />
                    Wallet Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 lg:px-5 lg:pb-4">
                  <p className="text-[10px] lg:text-xs text-muted-foreground">
                    Track any Lighter wallet's positions, trades, PnL, and performance metrics in real-time.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="py-3 px-4 lg:py-4 lg:px-5">
                  <CardTitle className="flex items-center gap-2 text-xs lg:text-sm">
                    <ChartBarIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" aria-hidden="true" />
                    Market Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 lg:px-5 lg:pb-4">
                  <p className="text-[10px] lg:text-xs text-muted-foreground">
                    View live order books, recent trades, funding rates, and comprehensive market statistics.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="py-3 px-4 lg:py-4 lg:px-5">
                  <CardTitle className="flex items-center gap-2 text-xs lg:text-sm">
                    <SignalIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" aria-hidden="true" />
                    Real-Time Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 lg:px-5 lg:pb-4">
                  <p className="text-[10px] lg:text-xs text-muted-foreground">
                    WebSocket-powered live data streams for instant market and account updates.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* AI Trader Insights Feature */}
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '100ms' }} aria-label="AI Trader Insights">
              <Card className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-primary/10 border-primary/20 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-4 lg:p-5">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 lg:mb-3">
                        <LightBulbIcon className="w-4 h-4 lg:w-5 lg:h-5 text-primary" aria-hidden="true" />
                        <h3 className="text-sm lg:text-base font-semibold text-foreground">AI Trader Insights</h3>
                        <Badge variant="default" className="text-[8px] lg:text-[9px] h-4 lg:h-5 px-1.5 lg:px-2">NEW</Badge>
                      </div>
                      <p className="text-[10px] lg:text-xs text-muted-foreground mb-3 lg:mb-4">
                        Unlock the power of AI to analyze your trading patterns and get personalized recommendations.
                      </p>
                      <ul className="space-y-1.5 lg:space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                          <span className="text-[10px] lg:text-xs">Upload your trade history CSV and get instant AI-powered analysis</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                          <span className="text-[10px] lg:text-xs">Identify your best and worst trading hours, days, and market conditions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                          <span className="text-[10px] lg:text-xs">Get personalized tips to improve win rate and reduce losses</span>
                        </li>
                      </ul>
                    </div>
                    <a 
                      href="/trade-analyzer" 
                      className="shrink-0 inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-[10px] lg:text-xs font-medium transition-colors"
                    >
                      <LightBulbIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                      Try AI Insights
                    </a>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Detailed Features Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '150ms' }} aria-label="Detailed features">
              <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="py-3 px-4 lg:py-4 lg:px-5">
                  <CardTitle className="flex items-center gap-2 text-xs lg:text-sm">
                    <ChartBarIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" aria-hidden="true" />
                    Wallet Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 lg:px-5 lg:pb-4">
                  <ul className="space-y-1.5 lg:space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      <span className="text-[10px] lg:text-xs">Track total PnL, unrealized and realized gains across all positions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      <span className="text-[10px] lg:text-xs">Monitor portfolio value, leverage, and margin usage in real-time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      <span className="text-[10px] lg:text-xs">View detailed position breakdowns by asset with entry prices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      <span className="text-[10px] lg:text-xs">Compare multiple wallets side-by-side to analyze performance</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
                <CardHeader className="py-3 px-4 lg:py-4 lg:px-5">
                  <CardTitle className="flex items-center gap-2 text-xs lg:text-sm">
                    <CpuChipIcon className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" aria-hidden="true" />
                    Advanced Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 lg:px-5 lg:pb-4">
                  <ul className="space-y-1.5 lg:space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      <span className="text-[10px] lg:text-xs">AI-powered pattern recognition for winning and losing setups</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      <span className="text-[10px] lg:text-xs">Win/loss streak analysis with performance breakdown</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      <span className="text-[10px] lg:text-xs">Trading journal with custom notes and tags for every trade</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      <span className="text-[10px] lg:text-xs">Liquidation risk monitoring with real-time alerts</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </section>
          </div>
        ) : (
          <section aria-label="Wallet dashboard">
            <button
              onClick={() => {
                setScannedAddress(null);
                localStorage.removeItem('lighterdash-wallet');
                setSearchParams({});
              }}
              className="mb-4 flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors group"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="group-hover:-translate-x-1 transition-transform"
              >
                <path d="m12 19-7-7 7-7"/>
                <path d="M19 12H5"/>
              </svg>
              <span className="text-xs font-medium">Scan different wallet</span>
            </button>
            <Dashboard 
              walletAddress={scannedAddress}
              onConnectionStatusChange={handleConnectionChange}
            />
            <RealtimeLiquidationMonitor accountIndex={null} walletAddress={scannedAddress} />
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Index;