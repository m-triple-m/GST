-- ═══════════════════════════════════════════════════════
-- Migration: Add Membership Expiration & Expired Status
-- ═══════════════════════════════════════════════════════

-- 1. Modify status ENUM to include 'expired'
ALTER TABLE members 
  MODIFY COLUMN status ENUM('pending','active','inactive','expired') DEFAULT 'pending';

-- 2. Add expires_at column if not exists
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS expires_at DATETIME NULL AFTER joined_at,
  ADD INDEX IF NOT EXISTS idx_expires_at (expires_at);

-- 3. Backfill active members without an expiration date to 1 year after their joined_at date (or 1 year from now if joined_at is null)
UPDATE members
SET expires_at = DATE_ADD(COALESCE(joined_at, NOW()), INTERVAL 1 YEAR)
WHERE expires_at IS NULL AND status = 'active';

-- 4. Automatically mark any members whose expires_at is already in the past as 'expired'
UPDATE members
SET status = 'expired'
WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at < NOW();
