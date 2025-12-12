import { ClipboardDocumentIcon, CheckIcon, HeartIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

export function Footer() {
  const [copied, setCopied] = useState(false);
  const donationAddress = '0xfa2B8eD012f756E22E780B772d604af4575d5fcf';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(donationAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadLogo = () => {
    const link = document.createElement('a');
    link.href = '/logo.svg';
    link.download = 'lighterdash-logo.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <footer className="border-t border-border/50 mt-20 bg-card/50" role="contentinfo">
      <div className="container mx-auto px-4 py-6 space-y-2.5">
        <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
          Built with <HeartIcon className="w-4 h-4 text-primary" /> by{' '}
          <a
            href="https://www.0xnotes.lol/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors font-medium ml-1"
          >
            Jadeofwallstreet
          </a>
        </p>
        <div className="flex flex-col items-center gap-2">
          <p className="text-center text-xs text-muted-foreground">
            Support LighterDash development:
          </p>
          <div className="flex items-center gap-1.5 bg-muted/50 border border-border/50 rounded-lg px-3 py-1.5">
            <code className="text-[10px] sm:text-xs font-mono text-primary">
              {donationAddress}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
              title="Copy address"
            >
              {copied ? (
                <CheckIcon className="w-4 h-4 text-profit" />
              ) : (
                <ClipboardDocumentIcon className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <p className="text-center text-xs text-muted-foreground">
            Community-built Lighter analytics • Not affiliated with Lighter
          </p>
          <button
            onClick={downloadLogo}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            title="Download LighterDash logo"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
            <span>Logo</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
