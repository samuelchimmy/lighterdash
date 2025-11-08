-- Multi-Wallet Comparison: Store wallet comparisons
CREATE TABLE public.wallet_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  wallet_addresses TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own comparisons"
ON public.wallet_comparisons FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own comparisons"
ON public.wallet_comparisons FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comparisons"
ON public.wallet_comparisons FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comparisons"
ON public.wallet_comparisons FOR DELETE
USING (auth.uid() = user_id);

-- Copy Trading Signals: Track signal providers and followers
CREATE TABLE public.copy_trading_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_wallet TEXT NOT NULL,
  provider_name TEXT,
  total_followers INTEGER DEFAULT 0,
  win_rate NUMERIC,
  total_pnl NUMERIC,
  avg_trade_size NUMERIC,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.copy_trading_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public signals are viewable by everyone"
ON public.copy_trading_signals FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can create signals for their wallets"
ON public.copy_trading_signals FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own signals"
ON public.copy_trading_signals FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Social Features: Comments and reactions
CREATE TABLE public.trade_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  trade_id TEXT NOT NULL,
  market_id INTEGER NOT NULL,
  comment TEXT NOT NULL,
  parent_comment_id UUID,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trade_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
ON public.trade_comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.trade_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.trade_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.trade_comments FOR DELETE
USING (auth.uid() = user_id);

-- Community Leaderboard: Track top traders
CREATE TABLE public.leaderboard_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  display_name TEXT,
  total_pnl NUMERIC NOT NULL DEFAULT 0,
  win_rate NUMERIC,
  total_trades INTEGER DEFAULT 0,
  total_volume NUMERIC DEFAULT 0,
  rank INTEGER,
  is_public BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public leaderboard entries are viewable by everyone"
ON public.leaderboard_entries FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can create their leaderboard entry"
ON public.leaderboard_entries FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own leaderboard entry"
ON public.leaderboard_entries FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Backtesting: Store backtest results
CREATE TABLE public.backtest_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  strategy_config JSONB NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_return NUMERIC,
  sharpe_ratio NUMERIC,
  max_drawdown NUMERIC,
  win_rate NUMERIC,
  total_trades INTEGER,
  results_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.backtest_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own backtest results"
ON public.backtest_results FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own backtest results"
ON public.backtest_results FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own backtest results"
ON public.backtest_results FOR DELETE
USING (auth.uid() = user_id);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wallet_comparisons_updated_at
BEFORE UPDATE ON public.wallet_comparisons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_copy_trading_signals_updated_at
BEFORE UPDATE ON public.copy_trading_signals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trade_comments_updated_at
BEFORE UPDATE ON public.trade_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();