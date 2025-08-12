-- Add table session management columns
-- Run this in your Supabase SQL editor

-- Add session management columns to tables
ALTER TABLE tables 
ADD COLUMN IF NOT EXISTS session_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS session_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS session_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS activated_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Add index for better performance on session queries
CREATE INDEX IF NOT EXISTS idx_tables_session_active ON tables(session_active);
CREATE INDEX IF NOT EXISTS idx_tables_session_expires ON tables(session_expires_at);

-- Add restaurant-level settings for order management
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS ordering_hours JSONB DEFAULT '{"start": "09:00", "end": "22:00"}',
ADD COLUMN IF NOT EXISTS default_session_duration INTEGER DEFAULT 240; -- minutes (4 hours)

-- Update existing tables to have capacity and location if not set
UPDATE tables 
SET capacity = 4, location = 'Main Dining' 
WHERE capacity IS NULL OR location IS NULL;

-- Create a function to activate table session
CREATE OR REPLACE FUNCTION activate_table_session(
    table_id UUID,
    staff_name VARCHAR(255) DEFAULT 'Staff',
    duration_minutes INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    restaurant_default_duration INTEGER;
BEGIN
    -- Get restaurant's default session duration if not provided
    IF duration_minutes IS NULL THEN
        SELECT default_session_duration INTO restaurant_default_duration
        FROM restaurants r
        JOIN tables t ON t.restaurant_id = r.id
        WHERE t.id = table_id;
        
        duration_minutes := COALESCE(restaurant_default_duration, 240);
    END IF;
    
    -- Activate the table session
    UPDATE tables 
    SET 
        session_active = true,
        session_started_at = NOW(),
        session_expires_at = NOW() + (duration_minutes || ' minutes')::INTERVAL,
        activated_by = staff_name
    WHERE id = table_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create a function to deactivate table session
CREATE OR REPLACE FUNCTION deactivate_table_session(table_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE tables 
    SET 
        session_active = false,
        session_started_at = NULL,
        session_expires_at = NULL,
        activated_by = NULL
    WHERE id = table_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if table session is valid
CREATE OR REPLACE FUNCTION is_table_session_valid(table_id UUID) RETURNS BOOLEAN AS $$
DECLARE
    table_record RECORD;
BEGIN
    SELECT session_active, session_expires_at, is_active
    INTO table_record
    FROM tables 
    WHERE id = table_id;
    
    -- Table must exist, be active, have active session, and not be expired
    IF NOT FOUND OR NOT table_record.is_active OR NOT table_record.session_active THEN
        RETURN false;
    END IF;
    
    -- Check if session has expired
    IF table_record.session_expires_at IS NOT NULL AND table_record.session_expires_at < NOW() THEN
        -- Auto-deactivate expired session
        PERFORM deactivate_table_session(table_id);
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Create a function to extend table session
CREATE OR REPLACE FUNCTION extend_table_session(
    table_id UUID,
    additional_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE tables 
    SET session_expires_at = COALESCE(session_expires_at, NOW()) + (additional_minutes || ' minutes')::INTERVAL
    WHERE id = table_id AND session_active = true;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create a view for active table sessions (useful for staff dashboard)
CREATE OR REPLACE VIEW active_table_sessions AS
SELECT 
    t.id,
    t.restaurant_id,
    t.table_number,
    t.capacity,
    t.location,
    t.session_active,
    t.session_started_at,
    t.session_expires_at,
    t.activated_by,
    r.name as restaurant_name,
    CASE 
        WHEN t.session_expires_at < NOW() THEN 'expired'
        WHEN t.session_expires_at < NOW() + INTERVAL '30 minutes' THEN 'expiring_soon'
        ELSE 'active'
    END as session_status,
    EXTRACT(EPOCH FROM (t.session_expires_at - NOW()))/60 as minutes_remaining
FROM tables t
JOIN restaurants r ON t.restaurant_id = r.id
WHERE t.session_active = true AND t.is_active = true
ORDER BY t.table_number;

-- Update RLS policy for tables to include session validation
CREATE POLICY "Public read access for active table sessions" ON tables 
FOR SELECT USING (is_active = true AND session_active = true AND (session_expires_at IS NULL OR session_expires_at > NOW()));

COMMENT ON FUNCTION activate_table_session IS 'Activates a table session for customer ordering';
COMMENT ON FUNCTION deactivate_table_session IS 'Deactivates a table session';
COMMENT ON FUNCTION is_table_session_valid IS 'Checks if a table session is currently valid for ordering';
COMMENT ON FUNCTION extend_table_session IS 'Extends an active table session by specified minutes';
COMMENT ON VIEW active_table_sessions IS 'View of all currently active table sessions with status information';