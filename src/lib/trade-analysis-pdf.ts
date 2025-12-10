import jsPDF from 'jspdf';
import type { AnalysisResult } from './csv-trade-analyzer';

const formatCurrency = (value: number): string => {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

export const exportTradeAnalysisToPDF = (analysis: AnalysisResult, fileName?: string) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;

  const checkAddPage = (height: number) => {
    if (yPos + height > pageHeight - 20) {
      pdf.addPage();
      yPos = 20;
    }
  };

  // Header
  pdf.setFillColor(124, 58, 237);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('AI Trader Insights Report', 15, 25);
  
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 33);
  
  yPos = 50;

  // KPI Summary Section
  pdf.setFontSize(16);
  pdf.setTextColor(124, 58, 237);
  pdf.text('Performance Summary', 15, yPos);
  yPos += 12;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  const { kpis } = analysis;
  const kpiData = [
    ['Net Closed PnL:', formatCurrency(kpis.netPnL)],
    ['Total Fees:', formatCurrency(kpis.totalFees)],
    ['Win Rate:', `${formatPercent(kpis.winRate)} (${kpis.winningTrades}W / ${kpis.losingTrades}L)`],
    ['Profit Factor:', kpis.profitFactor === Infinity ? '∞' : kpis.profitFactor.toFixed(2)],
    ['Gross Profit:', formatCurrency(kpis.grossProfit)],
    ['Gross Loss:', formatCurrency(-kpis.grossLoss)],
    ['Avg Winner:', formatCurrency(kpis.avgWinningTrade)],
    ['Avg Loser:', formatCurrency(-kpis.avgLosingTrade)],
    ['Payoff Ratio:', kpis.payoffRatio === Infinity ? '∞' : kpis.payoffRatio.toFixed(2)],
    ['Total Trades:', kpis.totalTrades.toString()],
  ];

  kpiData.forEach(([label, value]) => {
    pdf.text(label, 20, yPos);
    pdf.text(value, 80, yPos);
    yPos += 7;
  });
  yPos += 10;

  // Side Analysis Section
  checkAddPage(50);
  pdf.setFontSize(16);
  pdf.setTextColor(124, 58, 237);
  pdf.text('Long vs Short Analysis', 15, yPos);
  yPos += 12;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  const { sideAnalysis } = analysis;
  const sideData = [
    ['Long PnL:', formatCurrency(sideAnalysis.long.pnl), `Win Rate: ${formatPercent(sideAnalysis.long.winRate)}`, `Trades: ${sideAnalysis.long.trades}`],
    ['Short PnL:', formatCurrency(sideAnalysis.short.pnl), `Win Rate: ${formatPercent(sideAnalysis.short.winRate)}`, `Trades: ${sideAnalysis.short.trades}`],
  ];

  sideData.forEach(([label, pnl, winRate, trades]) => {
    pdf.text(label, 20, yPos);
    pdf.text(pnl, 55, yPos);
    pdf.text(winRate, 95, yPos);
    pdf.text(trades, 145, yPos);
    yPos += 7;
  });
  yPos += 10;

  // Role Analysis Section
  checkAddPage(50);
  pdf.setFontSize(16);
  pdf.setTextColor(124, 58, 237);
  pdf.text('Maker vs Taker Analysis', 15, yPos);
  yPos += 12;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  const { roleAnalysis } = analysis;
  const roleData = [
    ['Maker PnL:', formatCurrency(roleAnalysis.maker.pnl), `Win Rate: ${formatPercent(roleAnalysis.maker.winRate)}`, `Trades: ${roleAnalysis.maker.trades}`],
    ['Taker PnL:', formatCurrency(roleAnalysis.taker.pnl), `Win Rate: ${formatPercent(roleAnalysis.taker.winRate)}`, `Trades: ${roleAnalysis.taker.trades}`],
  ];

  roleData.forEach(([label, pnl, winRate, trades]) => {
    pdf.text(label, 20, yPos);
    pdf.text(pnl, 55, yPos);
    pdf.text(winRate, 95, yPos);
    pdf.text(trades, 145, yPos);
    yPos += 7;
  });
  yPos += 10;

  // Market Breakdown Section
  checkAddPage(80);
  pdf.setFontSize(16);
  pdf.setTextColor(124, 58, 237);
  pdf.text('Market Breakdown', 15, yPos);
  yPos += 12;

  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);

  // Table headers
  const marketHeaders = ['Market', 'Net PnL', 'Win Rate', 'Trades', 'Avg PnL/Trade'];
  const marketColWidths = [30, 35, 30, 25, 40];
  let xPos = 15;
  
  marketHeaders.forEach((header, i) => {
    pdf.text(header, xPos, yPos);
    xPos += marketColWidths[i];
  });
  yPos += 7;

  analysis.marketBreakdown.slice(0, 15).forEach(market => {
    checkAddPage(10);
    xPos = 15;
    
    const rowData = [
      market.market,
      formatCurrency(market.netPnL),
      formatPercent(market.winRate),
      market.totalTrades.toString(),
      formatCurrency(market.avgPnLPerTrade),
    ];

    rowData.forEach((data, i) => {
      pdf.text(data, xPos, yPos);
      xPos += marketColWidths[i];
    });
    yPos += 6;
  });
  yPos += 10;

  // Daily Patterns Section
  checkAddPage(80);
  pdf.setFontSize(16);
  pdf.setTextColor(124, 58, 237);
  pdf.text('Daily Trading Patterns', 15, yPos);
  yPos += 12;

  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);

  const daysWithTrades = analysis.dailyPatterns.filter(d => d.trades > 0);
  daysWithTrades.forEach(day => {
    pdf.text(`${day.day}: ${formatCurrency(day.pnl)} | Win Rate: ${formatPercent(day.winRate)} | Trades: ${day.trades}`, 20, yPos);
    yPos += 6;
  });
  yPos += 10;

  // Hourly Patterns Summary
  checkAddPage(50);
  pdf.setFontSize(16);
  pdf.setTextColor(124, 58, 237);
  pdf.text('Best Trading Hours', 15, yPos);
  yPos += 12;

  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);

  const topHours = [...analysis.hourlyPatterns]
    .filter(h => h.trades > 0)
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, 5);

  topHours.forEach(hour => {
    const hourStr = `${hour.hour.toString().padStart(2, '0')}:00`;
    pdf.text(`${hourStr}: ${formatCurrency(hour.pnl)} | Win Rate: ${formatPercent(hour.winRate)} | Trades: ${hour.trades}`, 20, yPos);
    yPos += 6;
  });

  // Footer on all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Page ${i} of ${totalPages} | LighterDash.lol - AI Trader Insights`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save
  const outputName = fileName 
    ? `lighterdash-analysis-${fileName.replace('.csv', '')}-${Date.now()}.pdf`
    : `lighterdash-analysis-${Date.now()}.pdf`;
  pdf.save(outputName);
};
