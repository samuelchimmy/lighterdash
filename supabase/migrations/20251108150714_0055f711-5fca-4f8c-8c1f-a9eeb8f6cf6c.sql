-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trading journal table for storing notes and tags on trades
CREATE TABLE public.trade_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  trade_id TEXT NOT NULL,
  market_id INTEGER NOT NULL,
  note TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trade_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own trade notes"
  ON public.trade_notes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trade notes"
  ON public.trade_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trade notes"
  ON public.trade_notes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trade notes"
  ON public.trade_notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_trade_notes_user_wallet ON public.trade_notes(user_id, wallet_address);
CREATE INDEX idx_trade_notes_trade_id ON public.trade_notes(trade_id);

-- Update trigger for updated_at
CREATE TRIGGER update_trade_notes_updated_at
  BEFORE UPDATE ON public.trade_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create alert preferences table
CREATE TABLE public.alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  low_margin_threshold DECIMAL DEFAULT 0.2,
  high_margin_threshold DECIMAL DEFAULT 0.8,
  pnl_change_threshold DECIMAL DEFAULT 100,
  notify_on_liquidation BOOLEAN DEFAULT true,
  notify_on_large_pnl BOOLEAN DEFAULT true,
  notify_on_low_margin BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, wallet_address)
);

-- Enable RLS
ALTER TABLE public.alert_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own alert preferences"
  ON public.alert_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alert preferences"
  ON public.alert_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert preferences"
  ON public.alert_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Update trigger
CREATE TRIGGER update_alert_preferences_updated_at
  BEFORE UPDATE ON public.alert_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();