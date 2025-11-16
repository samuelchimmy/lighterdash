-- Create liquidations table to store historical liquidation events
CREATE TABLE IF NOT EXISTS public.liquidations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  market_id INTEGER NOT NULL,
  symbol TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('liquidation', 'deleverage')),
  price NUMERIC NOT NULL,
  size NUMERIC NOT NULL,
  usdc_amount NUMERIC NOT NULL,
  timestamp BIGINT NOT NULL,
  settlement_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_liquidation UNIQUE (wallet_address, timestamp, market_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_liquidations_wallet ON public.liquidations(wallet_address);
CREATE INDEX IF NOT EXISTS idx_liquidations_timestamp ON public.liquidations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_liquidations_market ON public.liquidations(market_id);

-- Enable RLS
ALTER TABLE public.liquidations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read liquidations (public data)
CREATE POLICY "Liquidations are viewable by everyone"
  ON public.liquidations
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert liquidations
CREATE POLICY "Authenticated users can insert liquidations"
  ON public.liquidations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);