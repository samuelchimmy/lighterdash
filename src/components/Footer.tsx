import { Copy, Check, Heart } from "lucide-react";
import { useState } from "react";

export function Footer() {
  const [copied, setCopied] = useState(false);
  const donationAddress = '0xfa2B8eD012f756E22E780B772d604af4575d5fcf';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(donationAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-border/50 mt-20 bg-card/50" role="contentinfo">
      <div className="container mx-auto px-4 py-8 space-y-4">
        <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
          Built with <Heart className="w-4 h-4 text-primary fill-primary" /> by{' '}
          <a
            href="https://x.com/MetisCharter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors font-medium ml-1"
          >
            Jadeofwallstreet
          </a>
        </p>
        <div className="flex flex-col items-center gap-3">
          <p className="text-center text-sm text-muted-foreground">
            Support LighterDash development:
          </p>
          <div className="flex items-center gap-2 bg-muted/50 border border-border/50 rounded-xl px-4 py-2">
            <code className="text-xs md:text-sm font-mono text-primary break-all">
              {donationAddress}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
              title="Copy address"
            >
              {copied ? (
                <Check className="w-4 h-4 text-profit" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
              )}
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Community-built analytics for Lighter • Not affiliated with Lighter
        </p>
      </div>
    </footer>
  );
}
