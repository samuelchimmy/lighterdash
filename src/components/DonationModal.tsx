import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Copy, Check, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'lighterdash_donation_seen';
const DONATION_ADDRESS = '0xfa2B8eD012f756E22E780B772d604af4575d5fcf';

export const DonationModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hasSeenDonation = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenDonation) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsOpen(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(DONATION_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-primary via-primary-glow to-purple-600 p-8 text-center">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
          
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4 animate-in zoom-in-50 duration-500">
              <Heart className="w-10 h-10 text-white fill-white animate-pulse" />
            </div>
            
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-white mb-2">
                Support LighterDash
              </DialogTitle>
              <DialogDescription className="text-white/90 text-base">
                Help us keep the lights on and build more amazing features!
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              LighterDash is a community-built project created with <span className="text-purple-400">💜</span> by{' '}
              <a
                href="https://x.com/MetisCharter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-glow font-medium inline-flex items-center gap-1 transition-colors"
              >
                Jadeofwallstreet
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
            
            <p className="text-sm text-muted-foreground">
              Your donations help cover hosting costs and development time. Every contribution, 
              no matter how small, keeps this tool free and accessible for everyone!
            </p>
          </div>

          {/* Donation Address Card */}
          <div className="bg-secondary/50 rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Donation Address:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-background px-3 py-2 rounded-lg text-foreground break-all border border-border">
                {DONATION_ADDRESS}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-success" />
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Features Preview */}
          <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl p-4 border border-primary/20">
            <p className="text-sm font-medium text-foreground mb-2">What's Coming Next:</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                AI-powered trading insights & pattern recognition
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                Real-time price alerts & notifications
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                Community leaderboards & competitions
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => {
                copyToClipboard();
                setTimeout(handleClose, 1500);
              }}
              className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              <Heart className="w-4 h-4" />
              Copy & Support
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            This message will only show once. You can find the donation address in the footer anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
