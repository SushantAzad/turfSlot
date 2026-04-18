-- ### MATCHMAKING & WAITLIST SCHEMA ###

-- 1. Open Games table
CREATE TABLE IF NOT EXISTS open_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_spots INTEGER NOT NULL CHECK (total_spots > 0),
  available_spots INTEGER NOT NULL CHECK (available_spots >= 0),
  split_fee DECIMAL(10, 2) NOT NULL CHECK (split_fee >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_spots CHECK (available_spots <= total_spots)
);

-- 2. Open Game Participants table
CREATE TABLE IF NOT EXISTS open_game_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  open_game_id UUID NOT NULL REFERENCES open_games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(open_game_id, user_id)
);

-- 3. Waitlists table
CREATE TYPE waitlist_status AS ENUM ('waiting', 'notified');

CREATE TABLE IF NOT EXISTS waitlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id UUID NOT NULL REFERENCES availability_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status waitlist_status DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slot_id, user_id)
);

-- Indexes
CREATE INDEX idx_open_games_turf_id ON open_games(turf_id);
CREATE INDEX idx_open_games_active ON open_games(is_active);
CREATE INDEX idx_open_game_participants_user ON open_game_participants(user_id);
CREATE INDEX idx_waitlists_slot_id ON waitlists(slot_id);

-- RLS Policies for open_games
ALTER TABLE open_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY open_games_read ON open_games FOR SELECT USING (true);
CREATE POLICY open_games_insert ON open_games FOR INSERT WITH CHECK (auth.uid()::uuid = host_id);
CREATE POLICY open_games_update ON open_games FOR UPDATE USING (auth.uid()::uuid = host_id);

-- RLS Policies for open_game_participants
ALTER TABLE open_game_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY participants_read ON open_game_participants FOR SELECT USING (true);
CREATE POLICY participants_insert ON open_game_participants FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);
CREATE POLICY participants_update ON open_game_participants FOR UPDATE USING (auth.uid()::uuid = user_id);
CREATE POLICY participants_delete ON open_game_participants FOR DELETE USING (auth.uid()::uuid = user_id);

-- RLS Policies for waitlists
ALTER TABLE waitlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY waitlists_read ON waitlists FOR SELECT USING (auth.uid()::uuid = user_id);
CREATE POLICY waitlists_insert ON waitlists FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);
CREATE POLICY waitlists_delete ON waitlists FOR DELETE USING (auth.uid()::uuid = user_id);

-- Waitlist Notification Trigger Database Function
CREATE OR REPLACE FUNCTION notify_waitlisted_users()
RETURNS TRIGGER AS $$
DECLARE
  w_user RECORD;
BEGIN
  -- If a booking is cancelled or rejected, and the slot is freed up
  IF (NEW.status = 'cancelled' OR NEW.status = 'rejected') AND (OLD.status = 'approved' OR OLD.status = 'pending') THEN
    -- Find users on the waitlist for this slot_id
    FOR w_user IN SELECT user_id FROM waitlists WHERE slot_id = NEW.slot_id AND status = 'waiting' LOOP
      -- Create a notification for each waitlisted user
      INSERT INTO notifications (user_id, title, message)
      VALUES (
        w_user.user_id,
        'Slot Available!',
        'The slot you were waitlisted for has just become available. Book it quickly before someone else does!'
      );
    END LOOP;
    
    -- Update the waitlist status for those users
    UPDATE waitlists SET status = 'notified', updated_at = CURRENT_TIMESTAMP WHERE slot_id = NEW.slot_id AND status = 'waiting';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Waitlist trigger execution
CREATE TRIGGER trigger_notify_waitlist
AFTER UPDATE OF status ON bookings
FOR EACH ROW
EXECUTE FUNCTION notify_waitlisted_users();
