import { Copy, Check } from "lucide-react";
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
    <footer className="border-t border-border mt-20" role="contentinfo">
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
  );
}
