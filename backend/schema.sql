-- ═══════════════════════════════════════════════
--  GST Backend — Full Database Schema
--  Geophysical Society of Tulsa
-- ═══════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS gst_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gst_db;

-- ─────────────────────────────────────────
--  USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('member','admin','executive') NOT NULL DEFAULT 'member',
  is_active     TINYINT(1) DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  MEMBERS (standalone — no user account required)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS members (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NULL UNIQUE,         -- optional; linked if applicant later creates an account
  email           VARCHAR(255) NOT NULL UNIQUE,     -- owns the email directly; no JOIN to users needed
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  phone           VARCHAR(30),
  linkedin_url    VARCHAR(500),
  company         VARCHAR(255),
  job_title       VARCHAR(255),
  experience      VARCHAR(50),
  industry        VARCHAR(100),
  motivation      TEXT,
  referred        TINYINT(1) DEFAULT 0,
  tier            ENUM('student','professional','corporate') DEFAULT 'professional',
  status          ENUM('pending','active','inactive') DEFAULT 'pending',
  is_executive    TINYINT(1) DEFAULT 0,
  exec_position   VARCHAR(100),
  exec_bio        TEXT,
  exec_photo_url  VARCHAR(500),
  joined_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_tier (tier),
  INDEX idx_is_executive (is_executive),
  INDEX idx_email (email)
);


-- ─────────────────────────────────────────
--  EVENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(500) NOT NULL,
  event_type       VARCHAR(100) NOT NULL,
  category         VARCHAR(100),
  description      TEXT,
  detailed_summary TEXT,
  speaker_name     VARCHAR(255),
  speaker_org      VARCHAR(255),
  speaker_image_url VARCHAR(500),
  speaker_bio      TEXT,
  event_date       DATE NOT NULL,
  start_time       TIME,
  end_time         TIME,
  rsvp_deadline    DATE,
  location_name    VARCHAR(255),
  location_address VARCHAR(500),
  location_type    ENUM('online','physical','hybrid') DEFAULT 'physical',
  location_url     VARCHAR(500),
  capacity         INT DEFAULT 0 COMMENT '0 = unlimited',
  ticket_cost          DECIMAL(10,2) DEFAULT 0.00,
  member_ticket_cost   DECIMAL(10,2) DEFAULT 0.00,
  non_member_ticket_cost DECIMAL(10,2) DEFAULT 0.00,
  register_url     VARCHAR(500),
  status           ENUM('upcoming','past','draft','cancelled') DEFAULT 'upcoming',
  featured         TINYINT(1) DEFAULT 0,
  color            VARCHAR(30) DEFAULT 'teal',
  banner_url       VARCHAR(500),
  video_url        VARCHAR(500),
  revenue          DECIMAL(10,2) DEFAULT 0.00,
  created_by       INT UNSIGNED,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_event_date (event_date),
  INDEX idx_featured (featured),
  FULLTEXT INDEX ft_search (title, description, speaker_name, category)
);

-- Event gallery images
CREATE TABLE IF NOT EXISTS event_gallery (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id   INT UNSIGNED NOT NULL,
  image_url  VARCHAR(500) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Event keynote bullet points
CREATE TABLE IF NOT EXISTS event_keynotes (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id   INT UNSIGNED NOT NULL,
  keynote    TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
--  EVENT REGISTRATIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_registrations (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id        INT UNSIGNED NOT NULL,
  user_id         INT UNSIGNED,
  attendee_name   VARCHAR(255) NOT NULL,
  attendee_email  VARCHAR(255) NOT NULL,
  company         VARCHAR(255),
  dietary_notes   VARCHAR(255),
  attendee_type   ENUM('member','guest') DEFAULT 'member',
  guests          JSON,
  payment_method  ENUM('card','at_door','waived') DEFAULT 'card',
  payment_status  ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  amount_paid     DECIMAL(10,2) DEFAULT 0.00,
  registered_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_event_id (event_id),
  INDEX idx_attendee_email (attendee_email)
);

-- ─────────────────────────────────────────
--  RESOURCES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resources (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id    INT UNSIGNED,
  title       VARCHAR(500) NOT NULL,
  speaker     VARCHAR(255),
  speaker_org VARCHAR(255),
  category    VARCHAR(100),
  year        YEAR,
  month       VARCHAR(30),
  has_video   TINYINT(1) DEFAULT 0,
  has_slides  TINYINT(1) DEFAULT 0,
  has_paper   TINYINT(1) DEFAULT 0,
  access      ENUM('public','members') DEFAULT 'members',
  duration    VARCHAR(30),
  summary     TEXT,
  video_url   VARCHAR(500),
  slides_url  VARCHAR(500),
  paper_url   VARCHAR(500),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
  INDEX idx_access (access),
  INDEX idx_year (year),
  INDEX idx_category (category),
  FULLTEXT INDEX ft_search (title, speaker, category, summary)
);

-- ─────────────────────────────────────────
--  DONATIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  donor_name     VARCHAR(255),
  donor_email    VARCHAR(255) NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  is_monthly     TINYINT(1) DEFAULT 0,
  payment_method ENUM('card','paypal','check') DEFAULT 'card',
  payment_status ENUM('pending','completed','failed') DEFAULT 'pending',
  user_id        INT UNSIGNED,
  donated_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_donor_email (donor_email),
  INDEX idx_payment_status (payment_status)
);

-- ─────────────────────────────────────────
--  CONTACT INQUIRIES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  subject    VARCHAR(500) NOT NULL,
  message    TEXT NOT NULL,
  is_read    TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_is_read (is_read)
);

-- ─────────────────────────────────────────
--  SPONSOR ENQUIRIES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sponsor_enquiries (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_name  VARCHAR(255) NOT NULL,
  contact_name  VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         VARCHAR(50),
  tier_interest VARCHAR(50),
  message       TEXT,
  status        ENUM('new','in_review','approved','declined') DEFAULT 'new',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
);

-- ─────────────────────────────────────────
--  REFRESH TOKENS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  token      VARCHAR(512) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- ─────────────────────────────────────────
--  AUDIT LOG
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED,
  action     VARCHAR(255) NOT NULL,
  target     VARCHAR(255),
  meta       JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- ─────────────────────────────────────────
--  NEWSLETTER SUBSCRIBERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  SEED: Default Admin User
--  password: Admin@123
-- ─────────────────────────────────────────
INSERT IGNORE INTO users (email, password_hash, role, is_active)
VALUES (
  'admin@gs-tulsa.org',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdP9kMzHTnRxTk6',
  'admin',
  1
);

-- ─────────────────────────────────────────
--  SYSTEM SETTINGS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_settings (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  setting_key   VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
