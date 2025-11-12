import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { MultiWalletComparison } from "@/components/MultiWalletComparison";
import { ArrowLeft } from "lucide-react";

export default function CommunityHub() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
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

        <MultiWalletComparison />
      </div>
      <Footer />
    </div>
  );
}
