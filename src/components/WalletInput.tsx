import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateEthereumAddress } from '@/lib/lighter-api';

interface WalletInputProps {
  onScan: (address: string) => void;
  isLoading?: boolean;
}

export const WalletInput = ({ onScan, isLoading = false }: WalletInputProps) => {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

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

    onScan(trimmedAddress);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter Lighter L1 Address (0x...)"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setError(''); // Clear error on input
              }}
              className="h-12 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 px-8 bg-primary hover:bg-primary-glow text-primary-foreground font-semibold"
          >
            <Search className="w-5 h-5 mr-2" />
            {isLoading ? 'Scanning...' : 'Scan Wallet'}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-loss">{error}</p>
        )}
      </div>
    </form>
  );
};
