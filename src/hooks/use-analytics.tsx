import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views on route change
    if (window.gtag) {
      window.gtag('config', 'G-L9CE5SD95M', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  // Custom event tracking
  const trackEvent = (
    eventName: string,
    eventParams?: Record<string, any>
  ) => {
    if (window.gtag) {
      window.gtag('event', eventName, eventParams);
    }
  };

  // Track wallet scans
  const trackWalletScan = (walletAddress: string) => {
    trackEvent('wallet_scan', {
      wallet_address: walletAddress.substring(0, 10) + '...', // Privacy-safe
    });
  };

  // Track calculator usage
  const trackCalculatorUse = (calculatorType: string) => {
    trackEvent('calculator_use', {
      calculator_type: calculatorType,
    });
  };

  // Track exports
  const trackExport = (exportType: 'csv' | 'pdf' | 'image') => {
    trackEvent('export_data', {
      export_type: exportType,
    });
  };

  // Track liquidation alerts
  const trackLiquidationAlert = (severity: string) => {
    trackEvent('liquidation_alert', {
      alert_severity: severity,
    });
  };

  // Track trade analysis
  const trackTradeAnalysis = (walletAddress: string, tradeCount: number) => {
    trackEvent('trade_analysis', {
      wallet_address: walletAddress.substring(0, 10) + '...',
      trade_count: tradeCount,
    });
  };

  return {
    trackEvent,
    trackWalletScan,
    trackCalculatorUse,
    trackExport,
    trackLiquidationAlert,
    trackTradeAnalysis,
  };
};
