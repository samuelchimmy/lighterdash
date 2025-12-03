import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { MultiWalletComparison } from "@/components/MultiWalletComparison";
import { ArrowLeft, GitCompare } from "lucide-react";

export default function CommunityHub() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <GitCompare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Multi-Wallet Comparison
                </h1>
                <p className="text-sm text-muted-foreground">
                  Compare trading performance across wallets
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <MultiWalletComparison />
      </main>

      <Footer />
    </div>
  );
}
