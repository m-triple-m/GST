-- ═══════════════════════════════════════════════════
--  Migration: Add super_admin role
--  Run this on any existing database that was created
--  before super_admin was added to the schema.
-- ═══════════════════════════════════════════════════

-- 1. Extend the ENUM to include 'super_admin'
ALTER TABLE users
  MODIFY COLUMN role ENUM('member','admin','executive','super_admin') NOT NULL DEFAULT 'member';

-- 2. (Optional) Promote an existing admin to super_admin by email:
--    UPDATE users SET role = 'super_admin' WHERE email = 'your-admin@example.com';

-- ═══════════════════════════════════════════════════
--  Done. The application will now accept super_admin
--  as a valid role during login and route guards.
-- ═══════════════════════════════════════════════════
