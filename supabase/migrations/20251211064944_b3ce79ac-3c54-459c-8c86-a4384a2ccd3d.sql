-- Add currency column to stores table with NGN as default
ALTER TABLE public.stores 
ADD COLUMN currency text NOT NULL DEFAULT 'NGN' 
CHECK (currency IN ('NGN', 'USD'));