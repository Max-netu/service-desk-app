
-- Add password hash field and remove Google-specific fields
ALTER TABLE users ADD COLUMN password_hash TEXT;

-- Update existing users to set a default password (they'll need to reset)
UPDATE users SET password_hash = '$2a$12$example.hash.for.migration' WHERE password_hash IS NULL;

-- Make password_hash required for new users
-- Note: SQLite doesn't support adding NOT NULL constraints to existing tables directly
