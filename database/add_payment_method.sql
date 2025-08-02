-- Migration to add payment_method column to orders table
-- Run this in your Supabase SQL editor if you have existing data

-- Add payment_method column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
        ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50);
        -- Add comment for documentation
        COMMENT ON COLUMN orders.payment_method IS 'Payment method used: cash, card, bank_transfer';
    END IF;
END $$;