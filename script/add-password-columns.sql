-- Add password_hash and salt columns to users table for local auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS salt VARCHAR;
