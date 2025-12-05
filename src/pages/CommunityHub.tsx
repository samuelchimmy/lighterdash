import { Layout } from "@/components/Layout";
import { MultiWalletComparison } from "@/components/MultiWalletComparison";
import { GitCompare } from "lucide-react";

export default function CommunityHub() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center gap-2.5 mb-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <GitCompare className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">
              Compare Wallets
            </h1>
            <p className="text-[10px] text-muted-foreground">
              Compare trading performance across multiple wallets
            </p>
          </div>
        </div>

        {/* Main Content */}
        <MultiWalletComparison />
      </div>
    </Layout>
  );
}