-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: gst_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `target` varchar(255) DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_inquiries`
--

DROP TABLE IF EXISTS `contact_inquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_inquiries` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(500) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_inquiries`
--

LOCK TABLES `contact_inquiries` WRITE;
/*!40000 ALTER TABLE `contact_inquiries` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_inquiries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donations`
--

DROP TABLE IF EXISTS `donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `donor_name` varchar(255) DEFAULT NULL,
  `donor_email` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `is_monthly` tinyint(1) DEFAULT '0',
  `payment_method` enum('card','paypal','check') DEFAULT 'card',
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `user_id` int unsigned DEFAULT NULL,
  `donated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_donor_email` (`donor_email`),
  KEY `idx_payment_status` (`payment_status`),
  CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donations`
--

LOCK TABLES `donations` WRITE;
/*!40000 ALTER TABLE `donations` DISABLE KEYS */;
/*!40000 ALTER TABLE `donations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_gallery`
--

DROP TABLE IF EXISTS `event_gallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_gallery` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `event_id` int unsigned NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `event_gallery_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_gallery`
--

LOCK TABLES `event_gallery` WRITE;
/*!40000 ALTER TABLE `event_gallery` DISABLE KEYS */;
INSERT INTO `event_gallery` VALUES (5,3,'/uploads/events/images/event-img-2-1782918579843.jpg',0),(6,3,'/uploads/events/images/event-img-2-1782918582289.png',1),(7,3,'/uploads/events/images/event-img-2-1782918593678.jpg',2);
/*!40000 ALTER TABLE `event_gallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_keynotes`
--

DROP TABLE IF EXISTS `event_keynotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_keynotes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `event_id` int unsigned NOT NULL,
  `keynote` text NOT NULL,
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `event_keynotes_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_keynotes`
--

LOCK TABLES `event_keynotes` WRITE;
/*!40000 ALTER TABLE `event_keynotes` DISABLE KEYS */;
INSERT INTO `event_keynotes` VALUES (3,3,'/uploads/events/resources/event-res-2-1782918599821.pptx',0);
/*!40000 ALTER TABLE `event_keynotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_registrations`
--

DROP TABLE IF EXISTS `event_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_registrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `event_id` int unsigned NOT NULL,
  `user_id` int unsigned DEFAULT NULL,
  `attendee_name` varchar(255) NOT NULL,
  `attendee_email` varchar(255) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `dietary_notes` varchar(255) DEFAULT NULL,
  `attendee_type` enum('member','guest') DEFAULT 'member',
  `guests` json DEFAULT NULL,
  `payment_method` enum('card','at_door','waived') DEFAULT 'card',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `amount_paid` decimal(10,2) DEFAULT '0.00',
  `registered_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `reminder_sent` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_attendee_email` (`attendee_email`),
  CONSTRAINT `event_registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_registrations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_registrations`
--

LOCK TABLES `event_registrations` WRITE;
/*!40000 ALTER TABLE `event_registrations` DISABLE KEYS */;
INSERT INTO `event_registrations` VALUES (1,4,3,'Mohammad Mubassir','triplem656@gmail.com',NULL,NULL,'member',NULL,'card','pending',25.00,'2026-07-03 22:38:10',0),(2,5,5,'Leon Kennedy','leon@mail.com',NULL,NULL,'member',NULL,'card','pending',25.00,'2026-07-04 12:02:36',0),(3,5,6,'Albert Wesker','albert@mail.com','Digipodium',NULL,'member',NULL,'card','pending',25.00,'2026-07-04 21:59:12',0),(4,6,3,'Mohammad Mubassir','triplem656@gmail.com',NULL,NULL,'member',NULL,'card','pending',25.00,'2026-07-05 23:10:20',0);
/*!40000 ALTER TABLE `event_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(500) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text,
  `detailed_summary` text,
  `speaker_name` varchar(255) DEFAULT NULL,
  `speaker_org` varchar(255) DEFAULT NULL,
  `event_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `duration_minutes` int unsigned DEFAULT NULL,
  `rsvp_deadline` date DEFAULT NULL,
  `location_name` varchar(255) DEFAULT NULL,
  `location_address` varchar(500) DEFAULT NULL,
  `location_type` enum('online','physical','hybrid') DEFAULT 'physical',
  `location_url` varchar(500) DEFAULT NULL,
  `capacity` int DEFAULT '0' COMMENT '0 = unlimited',
  `ticket_cost` decimal(10,2) DEFAULT '0.00',
  `member_ticket_cost` decimal(10,2) DEFAULT '0.00',
  `non_member_ticket_cost` decimal(10,2) DEFAULT '0.00',
  `register_url` varchar(500) DEFAULT NULL,
  `status` enum('upcoming','past','draft','cancelled') DEFAULT 'upcoming',
  `featured` tinyint(1) DEFAULT '0',
  `color` varchar(30) DEFAULT 'teal',
  `banner_url` varchar(500) DEFAULT NULL,
  `video_url` varchar(500) DEFAULT NULL,
  `revenue` decimal(10,2) DEFAULT '0.00',
  `created_by` int unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `speaker_image_url` varchar(500) DEFAULT NULL,
  `speaker_bio` text,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_status` (`status`),
  KEY `idx_event_date` (`event_date`),
  KEY `idx_featured` (`featured`),
  FULLTEXT KEY `ft_search` (`title`,`description`,`speaker_name`,`category`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'Q3 Technical Lucheon','Workshop',NULL,NULL,NULL,NULL,NULL,'2026-07-03',NULL,NULL,NULL,'2026-07-02',NULL,NULL,'physical',NULL,10,0.00,0.00,0.00,NULL,'upcoming',0,'teal',NULL,NULL,0.00,4,'2026-06-30 21:00:07','2026-06-30 21:00:07',NULL,NULL),(2,'Putting Seismic Within Reach for Small Operators: Economical, Small-Crew Seismic Acquisition in 2026','Technical Luncheon',NULL,'Join us for our May technical luncheon featuring a presentation on modern economical seismic acquisition techniques tailored for smaller operators in today\'s market.\n\nThe Geophysical Society of Tulsa hosts monthly technical luncheons during the season (September through May). These events bring together geophysicists, geologists, engineers, and students from across the Tulsa area for expert presentations on cutting-edge topics in exploration and production geophysics.',NULL,'Mr. Leon Kennedy','Connections Corporation','2026-07-04',NULL,NULL,NULL,'2026-07-02',NULL,'','physical',NULL,10,0.00,0.00,0.00,NULL,'upcoming',0,'teal',NULL,NULL,0.00,4,'2026-06-30 21:01:51','2026-07-01 19:54:59',NULL,NULL),(3,'some event title','Workshop',NULL,'fghfgh',NULL,'Mr. X','Umbrella','2026-06-30',NULL,NULL,NULL,'2026-06-30',NULL,NULL,'online','',50,0.00,0.00,0.00,NULL,'past',0,'teal',NULL,'https://www.youtube.com/watch?v=qQu_ujgcCcg',0.00,4,'2026-07-01 14:19:24','2026-07-01 20:22:30',NULL,NULL),(4,'Q4 Technical Luncheon — Basin Analysis Deep Dive','Technical Luncheon',NULL,'Join us for an in-depth discussion on the latest developments in Tulsa Basin exploration. Our keynote speaker will walk through seismic interpretation techniques and basin modelling workflows used in current production projects.',NULL,'Dr. Sarah Mitchell','University of Tulsa – Geosciences Dept.','2026-08-02',NULL,NULL,90,'2026-07-28',NULL,'Tulsa Country Club, 701 N Union Ave, Tulsa, OK 74127','physical',NULL,150,0.00,0.00,0.00,NULL,'upcoming',0,'teal',NULL,'https://www.youtube.com/watch?v=dQw4w9WgXcQ',0.00,2,'2026-07-03 22:36:56','2026-07-03 22:36:56',NULL,NULL),(5,'Q4 Technical Luncheon — Basin Analysis Deep Dive','Technical Luncheon',NULL,'Join us for an in-depth discussion on the latest developments in Tulsa Basin exploration. Our keynote speaker will walk through seismic interpretation techniques and basin modelling workflows used in current production projects.',NULL,'Dr. Sarah Mitchell','University of Tulsa – Geosciences Dept.','2026-08-03',NULL,NULL,90,'2026-07-29',NULL,'Tulsa Country Club, 701 N Union Ave, Tulsa, OK 74127','physical',NULL,150,0.00,0.00,0.00,NULL,'upcoming',0,'teal',NULL,'https://www.youtube.com/watch?v=dQw4w9WgXcQ',0.00,2,'2026-07-04 12:01:57','2026-07-04 12:01:57',NULL,NULL),(6,'Q4 Technical Luncheon — Basin Analysis Deep Dive','Technical Luncheon',NULL,'Join us for an in-depth discussion on the latest developments in Tulsa Basin exploration. Our keynote speaker will walk through seismic interpretation techniques and basin modelling workflows used in current production projects.',NULL,'Dr. Sarah Mitchell','University of Tulsa – Geosciences Dept.','2026-08-03',NULL,NULL,90,'2026-07-29',NULL,'Tulsa Country Club, 701 N Union Ave, Tulsa, OK 74127','physical',NULL,150,0.00,0.00,0.00,NULL,'upcoming',0,'teal',NULL,'https://www.youtube.com/watch?v=dQw4w9WgXcQ',0.00,6,'2026-07-04 21:48:36','2026-07-04 21:48:36',NULL,NULL);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `members` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `linkedin_url` varchar(500) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  `experience` varchar(50) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `motivation` text,
  `referred` tinyint(1) DEFAULT '0',
  `tier` enum('student','professional','corporate') DEFAULT 'professional',
  `status` enum('pending','active','inactive') DEFAULT 'pending',
  `is_executive` tinyint(1) DEFAULT '0',
  `exec_position` varchar(100) DEFAULT NULL,
  `exec_bio` text,
  `exec_photo_url` varchar(500) DEFAULT NULL,
  `joined_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_tier` (`tier`),
  KEY `idx_is_executive` (`is_executive`),
  KEY `idx_email` (`email`),
  CONSTRAINT `members_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES (2,3,'triplem656@gmail.com','http://localhost:5000/uploads/avatars/avatar-3-1783272513537.jpg','Mohammad','Mubassir',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'professional','active',0,NULL,NULL,NULL,'2026-06-30 20:16:17','2026-07-05 22:58:33'),(3,4,'mtriplem656@gmail.com','http://localhost:5000/uploads/avatars/avatar-4-1783272779619.jpg','Ada','Wong','','','','',NULL,NULL,NULL,0,'professional','active',1,NULL,NULL,NULL,'2026-06-30 20:49:05','2026-07-05 23:02:59'),(4,5,'leon@mail.com',NULL,'Leon','Kennedy',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'professional','active',0,NULL,NULL,NULL,'2026-07-04 11:58:43','2026-07-04 11:59:40'),(5,6,'albert@mail.com',NULL,'Albert','Wesker',NULL,NULL,'Digipodium','Geophysist','2-5 years','Geothermal Energy','some details here',0,'professional','active',1,NULL,NULL,NULL,'2026-07-04 21:39:04','2026-07-04 21:45:11'),(6,2,'admin@gst.com',NULL,'Admin','User',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'professional','active',0,NULL,NULL,NULL,'2026-07-05 22:51:35','2026-07-05 22:51:35');
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `subscribed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_otps`
--

DROP TABLE IF EXISTS `password_reset_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_otps`
--

LOCK TABLES `password_reset_otps` WRITE;
/*!40000 ALTER TABLE `password_reset_otps` DISABLE KEYS */;
INSERT INTO `password_reset_otps` VALUES (1,'mtriplem656@gmail.com','824748','2026-07-05 17:41:27',0,'2026-07-05 23:06:27'),(2,'triplem656@gmail.com','855938','2026-07-05 17:43:44',1,'2026-07-05 23:08:44');
/*!40000 ALTER TABLE `password_reset_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `token` varchar(512) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgyODE3NzY3LCJleHAiOjE3ODM0MjI1Njd9.sZ9UFruLMz8eAdO3fYGusKYF51VzpJhjp8_mp8ql0Lw','2026-07-07 11:09:27','2026-06-30 16:39:27'),(2,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgyODI3NjQ3LCJleHAiOjE3ODM0MzI0NDd9.EMTWdwGo1xPzT_fCLWT7hs7HZs4MZ7kdAKOVsPN4rDg','2026-07-07 13:54:07','2026-06-30 19:24:07'),(3,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgyODI5MTM0LCJleHAiOjE3ODM0MzM5MzR9.3VU4rVasrBgPSgs987oKX4dqgQng637FChWhW-Ym15w','2026-07-07 14:18:54','2026-06-30 19:48:54'),(4,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgyODMwNDA5LCJleHAiOjE3ODM0MzUyMDl9.heCK_X_AfDXfJADJyTZijpmjQTzXGBbPzSCSo87m_4Q','2026-07-07 14:40:09','2026-06-30 20:10:09'),(6,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtdHJpcGxlbTY1NkBnbWFpbC5jb20iLCJyb2xlIjoibWVtYmVyIiwiaWF0IjoxNzgyODMyNzc5LCJleHAiOjE3ODM0Mzc1Nzl9.TrWRWiyNet-5ZCXFJBDVVcVtINd_9o1DmwVlawinPsk','2026-07-07 15:19:39','2026-06-30 20:49:39'),(7,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgyODMyODAwLCJleHAiOjE3ODM0Mzc2MDB9.W4OeKRo507buHEDubSksQitYcMn7GQJoDwoQKOaFa_M','2026-07-07 15:20:00','2026-06-30 20:50:00'),(8,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtdHJpcGxlbTY1NkBnbWFpbC5jb20iLCJyb2xlIjoiZXhlY3V0aXZlIiwiaWF0IjoxNzgyODMzMzM3LCJleHAiOjE3ODM0MzgxMzd9.YoKMxT8IhpjpEidsT9BxhghxmSjq9ojJKThVsXhSLLM','2026-07-07 15:28:57','2026-06-30 20:58:57'),(9,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgyODgyMTU3LCJleHAiOjE3ODM0ODY5NTd9.jimI2ONMPnmrm5cRPihNpziXLYeoVfvQOLSCgY4l7DE','2026-07-08 05:02:37','2026-07-01 10:32:37'),(10,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtdHJpcGxlbTY1NkBnbWFpbC5jb20iLCJyb2xlIjoiZXhlY3V0aXZlIiwiaWF0IjoxNzgyODgyMjY5LCJleHAiOjE3ODM0ODcwNjl9.5W8ussYjJdMkICsIcqKInNYPSoQ7uPX-g3mdFW8Wl84','2026-07-08 05:04:29','2026-07-01 10:34:29'),(11,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgyODgzNzY3LCJleHAiOjE3ODM0ODg1Njd9.l2qvsSlOPkJ2O-1LZzy7WvPQYayDMXN6FUNISC0Vx_w','2026-07-08 05:29:27','2026-07-01 10:59:27'),(12,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtdHJpcGxlbTY1NkBnbWFpbC5jb20iLCJyb2xlIjoiZXhlY3V0aXZlIiwiaWF0IjoxNzgyODg5ODUyLCJleHAiOjE3ODM0OTQ2NTJ9.BZBFZNFoEIyqwViS1iJFsyg4xpzmKYb141gmnhewDew','2026-07-08 07:10:52','2026-07-01 12:40:52'),(13,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtdHJpcGxlbTY1NkBnbWFpbC5jb20iLCJyb2xlIjoiZXhlY3V0aXZlIiwiaWF0IjoxNzgyODk0MjIwLCJleHAiOjE3ODM0OTkwMjB9.ft_8vT68EY9fbixM6sK205S-ExDB94caP7OdEqhY1JI','2026-07-08 08:23:40','2026-07-01 13:53:40'),(14,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtdHJpcGxlbTY1NkBnbWFpbC5jb20iLCJyb2xlIjoiZXhlY3V0aXZlIiwiaWF0IjoxNzgyODk1NzM2LCJleHAiOjE3ODM1MDA1MzZ9.LAzlSo1Mye1up6FiJI1t9dkf2wSK5r7L_RNktY_9uPE','2026-07-08 08:48:56','2026-07-01 14:18:56'),(15,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtdHJpcGxlbTY1NkBnbWFpbC5jb20iLCJyb2xlIjoiZXhlY3V0aXZlIiwiaWF0IjoxNzgyODk4NzQ4LCJleHAiOjE3ODM1MDM1NDh9.AJT9DnUEB7QsG046qmb7EXhW-lw73yh8XgByfzwpgbg','2026-07-08 09:39:08','2026-07-01 15:09:08'),(16,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgyOTE1ODI4LCJleHAiOjE3ODM1MjA2Mjh9.cpxYd31kC0ZTtP4pvIX_6wLS0TkSvS3z_1WsbrHQTbs','2026-07-08 14:23:48','2026-07-01 19:53:48'),(17,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgyOTE3NTA0LCJleHAiOjE3ODM1MjIzMDR9.kZ3Xq16vxjAl6BUHvBNuu7hTQauF5Z_YDJSAhOs15H4','2026-07-08 14:51:44','2026-07-01 20:21:44'),(18,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgyOTE4NTYzLCJleHAiOjE3ODM1MjMzNjN9.F3xrtEQ50hY59846utvdJs0u9XNG-wmqgNHVSoadtss','2026-07-08 15:09:23','2026-07-01 20:39:23'),(19,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgyOTE5ODg3LCJleHAiOjE3ODM1MjQ2ODd9.WnFLTiu1iGWbtzm02IWZXt1jwmDlclkYhWdq2PidWjA','2026-07-08 15:31:27','2026-07-01 21:01:27'),(20,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMDA0Njc3LCJleHAiOjE3ODM2MDk0Nzd9.eN9BnltjaScw47WQUmUe0VWHVVXi7xGuiPigFD2zaDE','2026-07-09 15:04:37','2026-07-02 20:34:37'),(21,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMDc2ODQxLCJleHAiOjE3ODM2ODE2NDF9.xMRjzb18n_hGYaW7vf6Q6QozNLoQPLuuNwQnUACbFhQ','2026-07-10 11:07:21','2026-07-03 16:37:21'),(22,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMDc3MDQzLCJleHAiOjE3ODM2ODE4NDN9.IbO-EDO-MTLNZdxiJ31RsBipNdsVFo4X56CWfuvUupc','2026-07-10 11:10:43','2026-07-03 16:40:43'),(24,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMDk2NDAzLCJleHAiOjE3ODM3MDEyMDN9.qywzD-M73CsBpNjdlBTxnKPiS-tvwSSXAjhEgycac90','2026-07-10 16:33:23','2026-07-03 22:03:23'),(26,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMDk4NDA4LCJleHAiOjE3ODM3MDMyMDh9.GDIHwqmTIxinPTvry9mL55x6yxqYDDfJS0sIcO6-Dp0','2026-07-10 17:06:48','2026-07-03 22:36:48'),(28,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMTM4ODY5LCJleHAiOjE3ODM3NDM2Njl9.PA_vhTFTMiIT9FWHtUUv5x36a30r_7hyaeLK5F2g9hE','2026-07-11 04:21:09','2026-07-04 09:51:09'),(29,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMTQwMjQ1LCJleHAiOjE3ODM3NDUwNDV9.882UlgOrzgG8YQgRlCVDSqTyulxlr6bmwf7Hw3YX_YY','2026-07-11 04:44:05','2026-07-04 10:14:05'),(30,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMTQ2MjE4LCJleHAiOjE3ODM3NTEwMTh9.k1ebwqNpx1cMsQl1o6LjaYuBniggCtNDsQoMYSgnDc4','2026-07-11 06:23:38','2026-07-04 11:53:38'),(31,5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJsZW9uQG1haWwuY29tIiwicm9sZSI6Im1lbWJlciIsImlhdCI6MTc4MzE0NjU5NCwiZXhwIjoxNzgzNzUxMzk0fQ.MznGrNWWoxPAx1zI1bb7B1AlavRprftKKEW9BzKd0pE','2026-07-11 06:29:54','2026-07-04 11:59:54'),(32,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMTQ2ODIzLCJleHAiOjE3ODM3NTE2MjN9.QkgxOkEFXcAyLnko0kSGb5Azm_0NjdmFPwUL-wOU3xY','2026-07-11 06:33:43','2026-07-04 12:03:43'),(33,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMTQ2ODk5LCJleHAiOjE3ODM3NTE2OTl9.yeQZ7RSSUhc1dnWAhAaaHZsUxMFXiebOgLK4DAdD8YQ','2026-07-11 06:34:59','2026-07-04 12:04:59'),(34,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtdHJpcGxlbTY1NkBnbWFpbC5jb20iLCJyb2xlIjoiZXhlY3V0aXZlIiwiaWF0IjoxNzgzMTQ2OTEyLCJleHAiOjE3ODM3NTE3MTJ9.AS13Tf2Wvd5FANQ1BEOCMBSxanRB3Opa6sIU1MNeQdg','2026-07-11 06:35:12','2026-07-04 12:05:12'),(35,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtdHJpcGxlbTY1NkBnbWFpbC5jb20iLCJyb2xlIjoiZXhlY3V0aXZlIiwiaWF0IjoxNzgzMTQ2OTk4LCJleHAiOjE3ODM3NTE3OTh9.t2o2jmciPaGPjiJg2AB7otIgv25LI5juE6Ig9x5UOqQ','2026-07-11 06:36:38','2026-07-04 12:06:38'),(36,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMTgwNDYwLCJleHAiOjE3ODM3ODUyNjB9.DtKD6KGFXTeKVHFL14FRmNOLeJPVYg3AvMH1ehKJ9f8','2026-07-11 15:54:20','2026-07-04 21:24:20'),(37,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtdHJpcGxlbTY1NkBnbWFpbC5jb20iLCJyb2xlIjoiZXhlY3V0aXZlIiwiaWF0IjoxNzgzMTgwNDc5LCJleHAiOjE3ODM3ODUyNzl9.x9o5DhxVg5QFBNlVAeWL4KQt2QC-Kbe00wGgFbIkNUo','2026-07-11 15:54:39','2026-07-04 21:24:39'),(38,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMTgxMDg5LCJleHAiOjE3ODM3ODU4ODl9.3Nd83JJksxJibe5Gsar_ssN_QafCZSB-nOn-B-fYd7o','2026-07-11 16:04:49','2026-07-04 21:34:49'),(39,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJhbGJlcnRAbWFpbC5jb20iLCJyb2xlIjoiZXhlY3V0aXZlIiwiaWF0IjoxNzgzMTgxNjMxLCJleHAiOjE3ODM3ODY0MzF9.oAXTF0E3iV8f5xN9ONZgup2O09aHN8FwFaXy3KFbshA','2026-07-11 16:13:51','2026-07-04 21:43:51'),(40,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJhbGJlcnRAbWFpbC5jb20iLCJyb2xlIjoibWVtYmVyIiwiaWF0IjoxNzgzMTgxNjU2LCJleHAiOjE3ODM3ODY0NTZ9.1-3-0NPsb488BVj7YfSbwt7qWfogjnJxTwfLAVA1g9Q','2026-07-11 16:14:16','2026-07-04 21:44:16'),(41,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJhbGJlcnRAbWFpbC5jb20iLCJyb2xlIjoiZXhlY3V0aXZlIiwiaWF0IjoxNzgzMTgxNzIxLCJleHAiOjE3ODM3ODY1MjF9.uJClmXhCxoa3J6H7txmkehejo2OLyRlMtSDYpNNaLNM','2026-07-11 16:15:21','2026-07-04 21:45:21'),(43,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMTgzMDg5LCJleHAiOjE3ODM3ODc4ODl9.sRGUp6qSrO_djJwHdljHZzItaJ5MDKeV6bwvcVQ9K3s','2026-07-11 16:38:09','2026-07-04 22:08:09'),(44,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMjcyMDk1LCJleHAiOjE3ODM4NzY4OTV9.0XSyXmyl4VOxrXc2AR0zbjC-JsJylhogxiQnwKMCWAE','2026-07-12 17:21:35','2026-07-05 22:51:35'),(46,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtdHJpcGxlbTY1NkBnbWFpbC5jb20iLCJyb2xlIjoiZXhlY3V0aXZlIiwiaWF0IjoxNzgzMjcyNTgxLCJleHAiOjE3ODM4NzczODF9.yq-1ZI18U5p1G1qNoOW5kEf4QWj-9xrV9CdAmzuykJI','2026-07-12 17:29:41','2026-07-05 22:59:41'),(47,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJ0cmlwbGVtNjU2QGdtYWlsLmNvbSIsInJvbGUiOiJtZW1iZXIiLCJpYXQiOjE3ODMyNzMxOTMsImV4cCI6MTc4Mzg3Nzk5M30.3G8AIe9eXvHv9Ai4w3Upp2exO-xjJ2bCCB7hOiz8MJM','2026-07-12 17:39:53','2026-07-05 23:09:53'),(48,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtdHJpcGxlbTY1NkBnbWFpbC5jb20iLCJyb2xlIjoiZXhlY3V0aXZlIiwiaWF0IjoxNzgzMjczNjY4LCJleHAiOjE3ODM4Nzg0Njh9.oQSllWmUSVZ1OAOkcaGKcZXGl1zS39O7ddSXVYnxsr8','2026-07-12 17:47:48','2026-07-05 23:17:48'),(49,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJ0cmlwbGVtNjU2QGdtYWlsLmNvbSIsInJvbGUiOiJtZW1iZXIiLCJpYXQiOjE3ODMzMTE5MDYsImV4cCI6MTc4MzkxNjcwNn0.4oq4pG-hS9nUp3TjEQDsynhyyquUjIMUugYuTEVq-FU','2026-07-13 04:25:06','2026-07-06 09:55:06'),(50,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMzEyMDcwLCJleHAiOjE3ODM5MTY4NzB9.ploVGgBUzz41mPYOKvSvSmNiIlYtJ3GysPYQM5qc4_I','2026-07-13 04:27:50','2026-07-06 09:57:50'),(51,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJ0cmlwbGVtNjU2QGdtYWlsLmNvbSIsInJvbGUiOiJtZW1iZXIiLCJpYXQiOjE3ODMzMjQ0MTcsImV4cCI6MTc4MzkyOTIxN30._keyuP0qFj2ti2qfG6hTfKZ2gxoTKPgZXVaGie4N1WE','2026-07-13 07:53:37','2026-07-06 13:23:37'),(52,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMzI0NDM4LCJleHAiOjE3ODM5MjkyMzh9.I7P5J4ATPbvvoAwGQFENpwHgDCYH9YXXl3suRLakINg','2026-07-13 07:53:58','2026-07-06 13:23:58'),(53,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMzI1NTk5LCJleHAiOjE3ODM5MzAzOTl9.gkfxZvNWDm5vEA5SeDXn5_VpZdJEQ-kKMlcDJNu2yiQ','2026-07-13 08:13:19','2026-07-06 13:43:19'),(54,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMzM1ODM2LCJleHAiOjE3ODM5NDA2MzZ9.EWhSn_u6I-IqRIrVnTHuSECfgslmxuqUx0k0KHsPVIM','2026-07-13 11:03:56','2026-07-06 16:33:56'),(55,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMzQ3NDIwLCJleHAiOjE3ODM5NTIyMjB9.m0PydhKRWTT7GwbQ8PZ38Z0wA-hh4qxigLRsVJGVCic','2026-07-13 14:17:00','2026-07-06 19:47:00'),(56,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJ0cmlwbGVtNjU2QGdtYWlsLmNvbSIsInJvbGUiOiJtZW1iZXIiLCJpYXQiOjE3ODMzNDc0ODgsImV4cCI6MTc4Mzk1MjI4OH0.ECZSFXpSL_-4ckAL88ZvXICEp-9vD5sJlcFznUtfUKc','2026-07-13 14:18:08','2026-07-06 19:48:08'),(57,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMzQ3NTExLCJleHAiOjE3ODM5NTIzMTF9.RIcx62yRrY-249Hok-SM__t_WR3O1k05B-URSstdwLU','2026-07-13 14:18:31','2026-07-06 19:48:31'),(58,2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkBnc3QuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzgzMzQ4NDY4LCJleHAiOjE3ODM5NTMyNjh9.ECOEzgkt7LPMgr4BAIPpcJ_M7oSuJ4HaDB0hmHZntvI','2026-07-13 14:34:28','2026-07-06 20:04:28'),(59,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJ0cmlwbGVtNjU2QGdtYWlsLmNvbSIsInJvbGUiOiJtZW1iZXIiLCJpYXQiOjE3ODMzNDg2ODAsImV4cCI6MTc4Mzk1MzQ4MH0.D4ohw84yz5ptRkOR450jJkDcAp-ljioriVJXVyocZ1g','2026-07-13 14:38:00','2026-07-06 20:08:00');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resources` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `event_id` int unsigned DEFAULT NULL,
  `title` varchar(500) NOT NULL,
  `speaker` varchar(255) DEFAULT NULL,
  `speaker_org` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `year` year DEFAULT NULL,
  `month` varchar(30) DEFAULT NULL,
  `has_video` tinyint(1) DEFAULT '0',
  `has_slides` tinyint(1) DEFAULT '0',
  `has_paper` tinyint(1) DEFAULT '0',
  `access` enum('public','members') DEFAULT 'members',
  `duration` varchar(30) DEFAULT NULL,
  `summary` text,
  `video_url` varchar(500) DEFAULT NULL,
  `slides_url` varchar(500) DEFAULT NULL,
  `paper_url` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  KEY `idx_access` (`access`),
  KEY `idx_year` (`year`),
  KEY `idx_category` (`category`),
  FULLTEXT KEY `ft_search` (`title`,`speaker`,`category`,`summary`),
  CONSTRAINT `resources_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resources`
--

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
/*!40000 ALTER TABLE `resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sponsor_enquiries`
--

DROP TABLE IF EXISTS `sponsor_enquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sponsor_enquiries` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) NOT NULL,
  `contact_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `tier_interest` varchar(50) DEFAULT NULL,
  `message` text,
  `status` enum('new','in_review','approved','declined') DEFAULT 'new',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sponsor_enquiries`
--

LOCK TABLES `sponsor_enquiries` WRITE;
/*!40000 ALTER TABLE `sponsor_enquiries` DISABLE KEYS */;
/*!40000 ALTER TABLE `sponsor_enquiries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'global_event_fee','35.00','2026-07-06 05:06:22'),(2,'member_ticket_cost','25','2026-07-06 14:17:48'),(3,'non_member_ticket_cost','35','2026-07-06 14:17:48'),(4,'tier_student_price','80','2026-07-06 14:17:48'),(5,'tier_professional_price','110','2026-07-06 14:17:48'),(6,'tier_corporate_price','150','2026-07-06 14:17:48');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('member','admin','executive') NOT NULL DEFAULT 'member',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@gs-tulsa.org','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdP9kMzHTnRxTk6','admin',1,'2026-06-30 16:35:40','2026-06-30 16:35:40'),(2,'admin@gst.com','$2b$12$83zmxzaV5Bt0DkGKhG148OesmpRfuLTYa4FYm95iOZEttDHIAPF06','admin',1,'2026-06-30 16:38:09','2026-06-30 16:38:09'),(3,'triplem656@gmail.com','$2b$12$w7htwe.m96BlVvtrq/fXLuNfGZoskLF3gObhS5iKaRHjexrGoFEEG','member',1,'2026-06-30 20:16:17','2026-07-05 23:09:43'),(4,'mtriplem656@gmail.com','$2b$12$5Cl7lhR6tOMq18eKH/TXkuKxZeegLQNcpSSQOWmDagFwGZKTHAleS','executive',1,'2026-06-30 20:49:05','2026-07-05 22:59:35'),(5,'leon@mail.com','$2b$12$tu4L/xhpvH3XlWXY6AW6kuwapG6mbOTPflD.DstRjFfN2LnrhOu62','member',1,'2026-07-04 11:58:43','2026-07-04 11:58:43'),(6,'albert@mail.com','$2b$12$maJlwZHaEJIMlYo/uWdUC.IHKW0/v8rhCJFoHNrmXutdDGQWzwNoi','executive',1,'2026-07-04 21:39:04','2026-07-04 21:45:11');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-06 20:14:28
