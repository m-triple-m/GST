-- ═══════════════════════════════════════════════════
--  Migration: Add sponsors table
--  Run this on any existing database.
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sponsors (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL,
  logo_url    VARCHAR(1000) NOT NULL,
  website_url VARCHAR(1000),
  tier        ENUM('bronze','silver','gold','platinum') NOT NULL DEFAULT 'bronze',
  is_active   TINYINT(1)    NOT NULL DEFAULT 1,
  sort_order  INT UNSIGNED  NOT NULL DEFAULT 0,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tier      (tier),
  INDEX idx_is_active (is_active),
  INDEX idx_sort      (sort_order)
);
