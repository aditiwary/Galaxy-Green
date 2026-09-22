-- =========================================================
-- Galaxy Green Sai Suraksha Nagar - MySQL Database Schema
-- Compatible with MySQL 5.7, 8.0+, MariaDB, Cloud SQL, AWS RDS
-- =========================================================

CREATE DATABASE IF NOT EXISTS `galaxy_green`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `galaxy_green`;

-- ---------------------------------------------------------
-- Table: plots
-- Stores residential plots inventory, status, and pricing
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plots` (
  `id` VARCHAR(64) NOT NULL,
  `number` VARCHAR(32) NOT NULL,
  `size_sq_ft` INT UNSIGNED NOT NULL,
  `dimensions` VARCHAR(64) NOT NULL,
  `facing` ENUM('East', 'North', 'Park Facing', 'Boulevard Corner', 'West', 'South') NOT NULL,
  `road_width` VARCHAR(64) NOT NULL DEFAULT '30 ft Internal',
  `rate_per_sq_ft` DECIMAL(10, 2) NOT NULL DEFAULT 1199.00,
  `status` ENUM('Available', 'Fast Selling', 'Reserved', 'Sold Out') NOT NULL DEFAULT 'Available',
  `feature` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_plot_number` (`number`),
  KEY `idx_plot_status` (`status`),
  KEY `idx_plot_size` (`size_sq_ft`),
  KEY `idx_plot_facing` (`facing`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table: inquiries
-- Stores customer site visit bookings, leads, and status
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `plot_preference` VARCHAR(100) NOT NULL DEFAULT '1000 sq ft',
  `visit_date` DATE DEFAULT NULL,
  `slot` VARCHAR(50) NOT NULL DEFAULT 'Morning (10:00 AM)',
  `cab_pickup` TINYINT(1) NOT NULL DEFAULT 0,
  `pickup_location` VARCHAR(150) NOT NULL DEFAULT 'On Site',
  `message` TEXT DEFAULT NULL,
  `status` ENUM('New', 'Contacted', 'Visit Scheduled', 'Site Visit Done', 'Booked') NOT NULL DEFAULT 'New',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inquiry_phone` (`phone`),
  KEY `idx_inquiry_status` (`status`),
  KEY `idx_inquiry_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table: admin_config
-- Stores portal settings, security PIN, and webhook URLs
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_config` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `google_sheets_webhook_url` VARCHAR(255) DEFAULT '',
  `dealer_pin` VARCHAR(255) NOT NULL DEFAULT '0000',
  `base_rate_per_sq_ft` DECIMAL(10, 2) NOT NULL DEFAULT 1199.00,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------
-- Table: gallery_photos
-- Stores live project site photos, captions, and categories
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS `gallery_photos` (
  `id` VARCHAR(64) NOT NULL,
  `src` LONGTEXT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'demarcation',
  `category_label` VARCHAR(100) NOT NULL DEFAULT 'Actual Site',
  `tag` VARCHAR(100) NOT NULL DEFAULT 'Live Photo',
  `description` TEXT,
  `dimensions_label` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_photo_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
