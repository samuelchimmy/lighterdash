import { useState, useEffect, useRef } from 'react';
import { Search, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateEthereumAddress } from '@/lib/lighter-api';

// Helper component for filled icons
const FilledIcon = ({ Icon, className }: { Icon: any; className?: string }) => (
  <Icon className={className} fill="currentColor" fillOpacity={0.2} />
);

interface WalletInputProps {
  onScan: (address: string) => void;
  isLoading?: boolean;
}

const STORAGE_KEY = 'lighter_scanned_wallets';

export const WalletInput = ({ onScan, isLoading = false }: WalletInputProps) => {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [previousWallets, setPreviousWallets] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load previously scanned wallets from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPreviousWallets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved wallets:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveWallet = (wallet: string) => {
    const updated = [wallet, ...previousWallets.filter(w => w !== wallet)].slice(0, 10);
    setPreviousWallets(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removeWallet = (wallet: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = previousWallets.filter(w => w !== wallet);
    setPreviousWallets(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setError('Please enter a wallet address');
      return;
    }

    if (!validateEthereumAddress(trimmedAddress)) {
      setError('Invalid Ethereum address format. Address must start with 0x followed by 40 hexadecimal characters.');
      return;
    }

    saveWallet(trimmedAddress);
    setShowDropdown(false);
    onScan(trimmedAddress);
  };

  const selectWallet = (wallet: string) => {
    setAddress(wallet);
    setShowDropdown(false);
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 sm:gap-3 relative">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Enter L1 Address (0x...)"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError('');
              }}
              onFocus={() => previousWallets.length > 0 && setShowDropdown(true)}
              className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground text-sm rounded-xl shadow-card pl-4 pr-4"
              disabled={isLoading}
            />
            
            {showDropdown && previousWallets.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-xl shadow-card-hover z-50 max-h-64 overflow-y-auto"
              >
                <div className="p-2">
                  <div className="text-xs text-muted-foreground px-3 py-2 font-medium">
                    Previously scanned wallets
                  </div>
                  {previousWallets.map((wallet) => (
                    <button
                      key={wallet}
                      type="button"
                      onClick={() => selectWallet(wallet)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 rounded-lg text-sm group transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-muted">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" fill="currentColor" fillOpacity={0.2} />
                      </div>
                      <span className="text-foreground truncate flex-1 text-left font-mono text-xs">
                        {wallet}
                      </span>
                      <button
                        onClick={(e) => removeWallet(wallet, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 rounded-lg transition-all"
                        title="Remove from history"
                      >
                        <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-card gap-2"
          >
            <Search className="w-5 h-5" fill="currentColor" fillOpacity={0.2} />
            <span className="hidden sm:inline">Scan</span>
          </Button>
        </div>
        {error && (
          <p className="text-sm text-loss">{error}</p>
        )}
      </div>
    </form>
  );
};
