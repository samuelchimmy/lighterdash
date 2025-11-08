import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MultiWalletComparison } from "@/components/MultiWalletComparison";
import { ArrowLeft } from "lucide-react";

export default function CommunityHub() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 animate-pulse opacity-50" style={{ animationDuration: '8s' }} />
      <div className="absolute inset-0 bg-gradient-to-tl from-pink-500/5 via-transparent to-primary/5 animate-pulse opacity-30" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      
      {/* Content wrapper */}
      <div className="relative z-10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Multi-Wallet Comparison
          </h1>
          <p className="text-muted-foreground">
            Compare trading performance across multiple wallets
          </p>
      </div>
    </div>

        <MultiWalletComparison />
      </div>
    </div>
  );
}
