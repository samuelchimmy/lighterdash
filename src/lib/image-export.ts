import html2canvas from 'html2canvas';

export const exportToImage = async (elementId: string, fileName: string): Promise<void> => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0f0f14',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${fileName}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error exporting to image:', error);
    throw error;
  }
};

export const createShareableCard = async (
  walletAddress: string,
  totalPnl: number,
  accountValue: number,
  winRate: number
): Promise<string> => {
  // Create a temporary card element with LighterDash brand colors
  const card = document.createElement('div');
  card.style.width = '600px';
  card.style.padding = '40px';
  card.style.background = 'linear-gradient(135deg, hsl(240 10% 5%) 0%, hsl(240 8% 8%) 100%)'; // Brand background gradient
  card.style.borderRadius = '20px';
  card.style.color = 'white';
  card.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  card.style.position = 'absolute';
  card.style.left = '-9999px';

  const isProfitable = totalPnl >= 0;
  
  card.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; background: linear-gradient(135deg, hsl(270 70% 60%), hsl(280 65% 65%)); padding: 15px 25px; border-radius: 12px; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">LighterDash</h1>
      </div>
      <p style="margin: 0; opacity: 0.7; font-size: 14px;">Lighter Trading Performance</p>
    </div>
    
    <div style="background: rgba(255, 255, 255, 0.05); padding: 25px; border-radius: 15px; margin-bottom: 20px;">
      <p style="margin: 0 0 8px 0; opacity: 0.7; font-size: 14px;">Wallet</p>
      <p style="margin: 0; font-family: monospace; font-size: 16px;">${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}</p>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
      <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 15px;">
        <p style="margin: 0 0 8px 0; opacity: 0.7; font-size: 14px;">Total PnL</p>
        <p style="margin: 0; font-size: 28px; font-weight: bold; color: ${isProfitable ? 'hsl(142 76% 36%)' : 'hsl(0 72% 51%)'};">
          ${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} USDC
        </p>
      </div>
      
      <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 15px;">
        <p style="margin: 0 0 8px 0; opacity: 0.7; font-size: 14px;">Account Value</p>
        <p style="margin: 0; font-size: 28px; font-weight: bold;">
          ${accountValue.toFixed(2)} USDC
        </p>
      </div>
    </div>
    
    <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 15px;">
      <p style="margin: 0 0 8px 0; opacity: 0.7; font-size: 14px;">Win Rate</p>
      <div style="background: rgba(255, 255, 255, 0.1); height: 30px; border-radius: 8px; overflow: hidden; position: relative;">
        <div style="background: linear-gradient(90deg, hsl(270 70% 60%), hsl(280 65% 65%)); height: 100%; width: ${winRate}%; transition: width 0.3s;"></div>
        <p style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); margin: 0; font-weight: bold; font-size: 16px;">
          ${winRate.toFixed(1)}%
        </p>
      </div>
    </div>
    
    <p style="text-align: center; margin: 25px 0 0 0; opacity: 0.5; font-size: 12px;">
      Generated on ${new Date().toLocaleDateString()} • LighterDash.lol
    </p>
  `;

  document.body.appendChild(card);

  try {
    const canvas = await html2canvas(card, {
      backgroundColor: null,
      scale: 2,
      logging: false,
    });

    document.body.removeChild(card);
    return canvas.toDataURL('image/png');
  } catch (error) {
    document.body.removeChild(card);
    throw error;
  }
};
