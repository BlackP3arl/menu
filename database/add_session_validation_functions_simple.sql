-- Additional helper functions for table session validation
-- Run this after add_table_session_management.sql

-- Function to validate table session by restaurant and table number (for customer access)
CREATE OR REPLACE FUNCTION is_table_session_valid_by_number(
    p_restaurant_id UUID,
    p_table_number VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
    table_id UUID;
BEGIN
    -- Get table ID
    SELECT id INTO table_id
    FROM tables 
    WHERE restaurant_id = p_restaurant_id 
      AND table_number = p_table_number
      AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Use existing validation function
    RETURN is_table_session_valid(table_id);
END;
$$ LANGUAGE plpgsql;

-- Simplified function to check restaurant ordering hours
CREATE OR REPLACE FUNCTION is_restaurant_open(p_restaurant_id UUID) RETURNS BOOLEAN AS $$
DECLARE
    restaurant_hours JSONB;
    start_time TEXT;
    end_time TEXT;
    current_hour INTEGER;
    current_minute INTEGER;
    start_hour INTEGER;
    start_minute INTEGER;
    end_hour INTEGER;
    end_minute INTEGER;
    current_minutes INTEGER;
    start_minutes INTEGER;
    end_minutes INTEGER;
BEGIN
    -- Get restaurant ordering hours
    SELECT ordering_hours INTO restaurant_hours
    FROM restaurants 
    WHERE id = p_restaurant_id AND is_active = true;
    
    IF NOT FOUND OR restaurant_hours IS NULL THEN
        RETURN true; -- Default to open if no hours set
    END IF;
    
    -- Get current hour and minute
    current_hour := EXTRACT(hour FROM NOW());
    current_minute := EXTRACT(minute FROM NOW());
    current_minutes := current_hour * 60 + current_minute;
    
    -- Parse start and end times
    start_time := restaurant_hours->>'start';
    end_time := restaurant_hours->>'end';
    
    IF start_time IS NULL OR end_time IS NULL THEN
        RETURN true; -- Default to open if times not set
    END IF;
    
    -- Parse start time (format: "HH:MM")
    start_hour := CAST(split_part(start_time, ':', 1) AS INTEGER);
    start_minute := CAST(split_part(start_time, ':', 2) AS INTEGER);
    start_minutes := start_hour * 60 + start_minute;
    
    -- Parse end time (format: "HH:MM")
    end_hour := CAST(split_part(end_time, ':', 1) AS INTEGER);
    end_minute := CAST(split_part(end_time, ':', 2) AS INTEGER);
    end_minutes := end_hour * 60 + end_minute;
    
    -- Check if current time is within ordering hours
    IF start_minutes <= end_minutes THEN
        -- Normal case (e.g., 09:00 to 22:00)
        RETURN current_minutes >= start_minutes AND current_minutes <= end_minutes;
    ELSE
        -- Crosses midnight (e.g., 22:00 to 02:00)
        RETURN current_minutes >= start_minutes OR current_minutes <= end_minutes;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to validate complete ordering access (table session + restaurant hours)
CREATE OR REPLACE FUNCTION can_place_order(
    p_restaurant_id UUID,
    p_table_number VARCHAR
) RETURNS TABLE(
    can_order BOOLEAN,
    reason TEXT,
    table_info JSONB
) AS $$
DECLARE
    table_record RECORD;
    restaurant_open BOOLEAN;
    session_valid BOOLEAN;
    result_reason TEXT := '';
    result_can_order BOOLEAN := false;
BEGIN
    -- Get table information
    SELECT t.*, r.name as restaurant_name, r.ordering_hours
    INTO table_record
    FROM tables t
    JOIN restaurants r ON t.restaurant_id = r.id
    WHERE t.restaurant_id = p_restaurant_id 
      AND t.table_number = p_table_number;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Table not found', NULL::JSONB;
        RETURN;
    END IF;
    
    -- Check if table is active
    IF NOT table_record.is_active THEN
        RETURN QUERY SELECT false, 'Table is not active', 
            json_build_object(
                'table_number', table_record.table_number,
                'restaurant_name', table_record.restaurant_name
            )::JSONB;
        RETURN;
    END IF;
    
    -- Check restaurant hours
    restaurant_open := is_restaurant_open(p_restaurant_id);
    
    -- Check table session
    session_valid := is_table_session_valid(table_record.id);
    
    -- Determine result
    IF NOT restaurant_open AND NOT session_valid THEN
        result_reason := 'Restaurant is closed and table session is not active';
    ELSIF NOT restaurant_open THEN
        result_reason := 'Restaurant is closed';
    ELSIF NOT session_valid THEN
        IF NOT table_record.session_active THEN
            result_reason := 'Table session has not been activated by staff';
        ELSIF table_record.session_expires_at IS NOT NULL AND table_record.session_expires_at < NOW() THEN
            result_reason := 'Table session has expired';
        ELSE
            result_reason := 'Table session is not valid';
        END IF;
    ELSE
        result_can_order := true;
        result_reason := 'Orders can be placed';
    END IF;
    
    RETURN QUERY SELECT 
        result_can_order,
        result_reason,
        json_build_object(
            'table_number', table_record.table_number,
            'restaurant_name', table_record.restaurant_name,
            'session_active', table_record.session_active,
            'session_expires_at', table_record.session_expires_at,
            'activated_by', table_record.activated_by,
            'restaurant_open', restaurant_open
        )::JSONB;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-cleanup expired sessions (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS INTEGER AS $$
DECLARE
    cleanup_count INTEGER;
BEGIN
    UPDATE tables 
    SET 
        session_active = false,
        session_started_at = NULL,
        session_expires_at = NULL,
        activated_by = NULL
    WHERE session_active = true 
      AND session_expires_at IS NOT NULL 
      AND session_expires_at < NOW();
    
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_table_session_valid_by_number IS 'Validates table session by restaurant ID and table number';
COMMENT ON FUNCTION is_restaurant_open IS 'Checks if restaurant is currently open for ordering';
COMMENT ON FUNCTION can_place_order IS 'Comprehensive validation for order placement capability';
COMMENT ON FUNCTION cleanup_expired_sessions IS 'Cleanup expired table sessions';