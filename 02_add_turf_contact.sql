-- Add contact_number column to turfs table
ALTER TABLE turfs ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20);
