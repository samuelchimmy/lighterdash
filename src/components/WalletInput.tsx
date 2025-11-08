import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateEthereumAddress } from '@/lib/lighter-api';
import { cn } from '@/lib/utils';

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
              className="h-10 sm:h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground text-sm"
              disabled={isLoading}
            />
            
            {showDropdown && previousWallets.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
              >
                <div className="p-2">
                  <div className="text-xs text-muted-foreground px-2 py-1 font-medium">
                    Previously scanned wallets
                  </div>
                  {previousWallets.map((wallet) => (
                    <button
                      key={wallet}
                      type="button"
                      onClick={() => selectWallet(wallet)}
                      className="w-full flex items-center gap-2 px-2 py-2 hover:bg-accent rounded-md text-sm group"
                    >
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-foreground truncate flex-1 text-left font-mono">
                        {wallet}
                      </span>
                      <button
                        onClick={(e) => removeWallet(wallet, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
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
            size="icon"
            className="h-10 w-10 sm:h-12 sm:w-12 bg-primary hover:bg-primary-glow text-primary-foreground shrink-0"
          >
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>
        {error && (
          <p className="text-sm text-loss">{error}</p>
        )}
      </div>
    </form>
  );
};
