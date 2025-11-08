import jsPDF from 'jspdf';
import type { UserStats, Position, LighterTrade } from '@/types/lighter';
import { formatCurrencySmart } from './lighter-api';

interface ExportPDFOptions {
  walletAddress: string;
  stats: UserStats | null;
  positions: Position[];
  trades: LighterTrade[];
}

export const exportToPDF = ({ walletAddress, stats, positions, trades }: ExportPDFOptions) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;

  // Helper to add page if needed
  const checkAddPage = (height: number) => {
    if (yPos + height > pageHeight - 20) {
      pdf.addPage();
      yPos = 20;
    }
  };

  // Header
  pdf.setFillColor(75, 50, 150); // Primary purple
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('LighterDash Report', 15, 25);
  
  pdf.setFontSize(10);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 33);
  
  yPos = 50;

  // Wallet Address
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.text('Wallet Address:', 15, yPos);
  pdf.setFontSize(10);
  pdf.text(walletAddress, 15, yPos + 6);
  yPos += 20;

  // Account Summary
  if (stats) {
    checkAddPage(60);
    pdf.setFontSize(16);
    pdf.setTextColor(75, 50, 150);
    pdf.text('Account Summary', 15, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    const portfolio = parseFloat(stats.portfolio_value || '0');
    const collateral = parseFloat(stats.collateral || '0');
    const totalPnl = portfolio - collateral;
    
    const summaryData = [
      ['Total Account Value:', formatCurrencySmart(portfolio)],
      ['Collateral:', formatCurrencySmart(collateral)],
      ['Total PnL:', formatCurrencySmart(totalPnl)],
      ['Leverage:', `${parseFloat(stats.leverage || '0').toFixed(2)}x`],
      ['Margin Usage:', `${parseFloat(stats.margin_usage || '0').toFixed(2)}%`],
      ['Available Balance:', formatCurrencySmart(parseFloat(stats.available_balance || '0'))],
    ];

    summaryData.forEach(([label, value]) => {
      pdf.text(label, 20, yPos);
      pdf.text(value, 100, yPos);
      yPos += 7;
    });
    yPos += 10;
  }

  // Positions
  if (positions.length > 0) {
    checkAddPage(80);
    pdf.setFontSize(16);
    pdf.setTextColor(75, 50, 150);
    pdf.text('Open Positions', 15, yPos);
    yPos += 10;

    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);

    // Table headers
    const headers = ['Asset', 'Size', 'Entry Price', 'Value', 'PnL'];
    const colWidths = [30, 35, 40, 40, 35];
    let xPos = 15;
    
    headers.forEach((header, i) => {
      pdf.text(header, xPos, yPos);
      xPos += colWidths[i];
    });
    yPos += 7;

    positions.slice(0, 10).forEach(position => {
      checkAddPage(10);
      xPos = 15;
      
      const rowData = [
        position.symbol || 'N/A',
        position.position || '0',
        formatCurrencySmart(parseFloat(position.avg_entry_price || '0')),
        formatCurrencySmart(parseFloat(position.position_value || '0')),
        formatCurrencySmart(parseFloat(position.unrealized_pnl || '0')),
      ];

      rowData.forEach((data, i) => {
        pdf.text(data.toString(), xPos, yPos);
        xPos += colWidths[i];
      });
      yPos += 6;
    });
    yPos += 10;
  }

  // Recent Trades
  if (trades.length > 0) {
    checkAddPage(80);
    pdf.setFontSize(16);
    pdf.setTextColor(75, 50, 150);
    pdf.text('Recent Trades (Last 15)', 15, yPos);
    yPos += 10;

    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);

    trades.slice(0, 15).forEach(trade => {
      checkAddPage(10);
      const side = trade.type || 'N/A';
      const size = trade.size || '0';
      const price = formatCurrencySmart(parseFloat(trade.price || '0'));
      const date = new Date(trade.timestamp * 1000).toLocaleString();
      
      pdf.text(`${side.toUpperCase()} ${size} @ ${price} - ${date}`, 20, yPos);
      yPos += 6;
    });
  }

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Page ${i} of ${totalPages} | LighterDash - Community Analytics for Lighter`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save
  const fileName = `lighterdash-${walletAddress.slice(0, 8)}-${Date.now()}.pdf`;
  pdf.save(fileName);
};
