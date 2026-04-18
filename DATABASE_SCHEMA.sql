-- ### DATABASE SCHEMA FOR TURF SLOT BOOKING ###

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUM types
CREATE TYPE user_role AS ENUM ('turf_owner', 'user');
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE turf_status AS ENUM ('active', 'inactive', 'archived');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role NOT NULL,
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  profile_picture_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_email_lowercase CHECK (email = LOWER(email))
);

-- Turfs table
CREATE TABLE turfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(500) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  price_per_slot DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  surface_type VARCHAR(50), -- grass, astroturf, concrete
  capacity INTEGER, -- number of players
  amenities TEXT[], -- parking, lights, changing_rooms, etc
  images_urls TEXT[], -- multiple images
  is_active turf_status DEFAULT 'active',
  opening_time TIME,
  closing_time TIME,
  slot_duration_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_price CHECK (price_per_slot > 0),
  CONSTRAINT valid_slot_duration CHECK (slot_duration_minutes > 0)
);

-- Availability Slots table
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(turf_id, slot_date, start_time),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES availability_slots(id) ON DELETE CASCADE,
  status booking_status DEFAULT 'pending',
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  confirmation_date TIMESTAMP WITH TIME ZONE,
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_total_price CHECK (total_price >= 0)
);

-- Payment Records table (for payment integration)
CREATE TABLE payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_method VARCHAR(50), -- card, upi, netbanking
  transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_amount CHECK (amount > 0)
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5)
);

-- Analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  total_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  average_rating DECIMAL(3, 2),
  total_reviews INTEGER DEFAULT 0,
  month DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(turf_id, month)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  message TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===== INDEXES =====

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Turfs indexes
CREATE INDEX idx_turfs_owner_id ON turfs(owner_id);
CREATE INDEX idx_turfs_is_active ON turfs(is_active);
CREATE INDEX idx_turfs_location ON turfs(location);

-- Availability Slots indexes
CREATE INDEX idx_slots_turf_id ON availability_slots(turf_id);
CREATE INDEX idx_slots_date_turf ON availability_slots(slot_date, turf_id);
CREATE INDEX idx_slots_is_booked ON availability_slots(is_booked);

-- Bookings indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_turf_id ON bookings(turf_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_slot_id ON bookings(slot_id);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
-- Unique index to prevent double booking (only one approved booking per slot)
CREATE UNIQUE INDEX idx_unique_approved_booking_per_slot ON bookings(slot_id) WHERE (status = 'approved');

-- Payment indexes
CREATE INDEX idx_payments_booking_id ON payment_records(booking_id);
CREATE INDEX idx_payments_status ON payment_records(status);

-- Reviews indexes
CREATE INDEX idx_reviews_turf_id ON reviews(turf_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Analytics indexes
CREATE INDEX idx_analytics_turf_id ON analytics(turf_id);
CREATE INDEX idx_analytics_month ON analytics(month);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ===== RLS (ROW LEVEL SECURITY) POLICIES =====

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE turfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Users RLS
CREATE POLICY users_read_policy ON users FOR SELECT USING (true);

CREATE POLICY users_insert_policy ON users FOR INSERT WITH CHECK (true);

CREATE POLICY users_update_policy ON users FOR UPDATE USING (
  auth.uid()::uuid = id
);

-- Turfs RLS
CREATE POLICY turfs_read_policy ON turfs FOR SELECT USING (true);

CREATE POLICY turfs_insert_policy ON turfs FOR INSERT WITH CHECK (
  auth.uid()::uuid = owner_id
);

CREATE POLICY turfs_update_policy ON turfs FOR UPDATE USING (
  auth.uid()::uuid = owner_id
);

CREATE POLICY turfs_delete_policy ON turfs FOR DELETE USING (
  auth.uid()::uuid = owner_id
);

-- Availability Slots RLS
CREATE POLICY slots_read_policy ON availability_slots FOR SELECT USING (true);

CREATE POLICY slots_insert_policy ON availability_slots FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM turfs WHERE turfs.id = availability_slots.turf_id 
    AND turfs.owner_id = auth.uid()::uuid
  )
);

-- Bookings RLS
CREATE POLICY bookings_read_policy ON bookings FOR SELECT USING (
  auth.uid()::uuid = user_id 
  OR EXISTS (
    SELECT 1 FROM turfs WHERE turfs.id = bookings.turf_id 
    AND turfs.owner_id = auth.uid()::uuid
  )
);

CREATE POLICY bookings_insert_policy ON bookings FOR INSERT WITH CHECK (
  auth.uid()::uuid = user_id
);

CREATE POLICY bookings_update_policy ON bookings FOR UPDATE USING (
  auth.uid()::uuid = user_id
  OR EXISTS (
    SELECT 1 FROM turfs WHERE turfs.id = bookings.turf_id 
    AND turfs.owner_id = auth.uid()::uuid
  )
);

-- Notifications RLS
CREATE POLICY notifications_read_policy ON notifications FOR SELECT USING (
  auth.uid()::uuid = user_id
);

CREATE POLICY notifications_insert_policy ON notifications FOR INSERT WITH CHECK (
  auth.uid()::uuid = user_id
);

-- ===== FUNCTIONS =====

-- Function to update turf analytics
CREATE OR REPLACE FUNCTION update_turf_analytics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE analytics
  SET 
    total_bookings = (
      SELECT COUNT(*) FROM bookings 
      WHERE turf_id = NEW.turf_id AND status = 'approved'
    ),
    total_revenue = (
      SELECT COALESCE(SUM(total_price), 0) FROM bookings 
      WHERE turf_id = NEW.turf_id AND status = 'approved'
    ),
    average_rating = (
      SELECT AVG(rating) FROM reviews 
      WHERE turf_id = NEW.turf_id
    ),
    total_reviews = (
      SELECT COUNT(*) FROM reviews 
      WHERE turf_id = NEW.turf_id
    )
  WHERE turf_id = NEW.turf_id AND month = DATE_TRUNC('month', CURRENT_DATE)::date;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics on booking
CREATE TRIGGER trigger_update_analytics_on_booking
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_turf_analytics();

-- Function to mark slot as booked when booking is approved
CREATE OR REPLACE FUNCTION update_slot_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE availability_slots SET is_booked = TRUE WHERE id = NEW.slot_id;
  ELSIF NEW.status = 'rejected' OR NEW.status = 'cancelled' THEN
    UPDATE availability_slots SET is_booked = FALSE WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update slot booking status
CREATE TRIGGER trigger_slot_booking_status
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_slot_booking_status();

-- Function to prevent double booking
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM bookings 
      WHERE slot_id = NEW.slot_id AND status = 'approved' 
      AND id != NEW.id) > 0 THEN
    RAISE EXCEPTION 'Slot already booked';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent double booking
CREATE TRIGGER trigger_prevent_double_booking
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION prevent_double_booking();

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title VARCHAR,
  p_message TEXT,
  p_booking_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, booking_id)
  VALUES (p_user_id, p_title, p_message, p_booking_id)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create initial analytics record
CREATE OR REPLACE FUNCTION create_initial_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics (turf_id, month)
  VALUES (NEW.id, DATE_TRUNC('month', CURRENT_DATE)::date)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create analytics for new turf
CREATE TRIGGER trigger_create_initial_analytics
AFTER INSERT ON turfs
FOR EACH ROW
EXECUTE FUNCTION create_initial_analytics();

-- ===== AUTH INTEGRATION =====

-- Function to handle new user signup from auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')::user_role,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
