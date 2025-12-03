import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import LighterAnalytics from "./pages/LighterAnalytics";
import CommunityHub from "./pages/CommunityHub";
import FuturesCalculator from "./pages/FuturesCalculator";
import Liquidations from "./pages/Liquidations";
import TradeAnalyzer from "./pages/TradeAnalyzer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/analytics" element={<LighterAnalytics />} />
            <Route path="/calculator" element={<FuturesCalculator />} />
            <Route path="/community" element={<CommunityHub />} />
            <Route path="/liquidations" element={<Liquidations />} />
            <Route path="/trade-analyzer" element={<TradeAnalyzer />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
