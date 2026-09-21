-- ====================================================================
-- Galaxy Green Sai Suraksha Nagar - Complete MySQL Export & Seed Script
-- Single-file import for phpMyAdmin / MySQL CLI / DBeaver / Workbench
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `galaxy_green`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `galaxy_green`;

-- --------------------------------------------------------------------
-- Table structure for table `plots`
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `plots`;
CREATE TABLE `plots` (
  `id` VARCHAR(64) NOT NULL,
  `number` VARCHAR(32) NOT NULL,
  `size_sq_ft` INT UNSIGNED NOT NULL,
  `dimensions` VARCHAR(64) NOT NULL,
  `facing` ENUM('East', 'North', 'Park Facing', 'Boulevard Corner', 'West', 'South') NOT NULL,
  `road_width` VARCHAR(64) NOT NULL DEFAULT '30 ft Internal',
  `rate_per_sq_ft` DECIMAL(10, 2) NOT NULL DEFAULT 1400.00,
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

-- --------------------------------------------------------------------
-- Dumping data for table `plots`
-- --------------------------------------------------------------------
INSERT INTO `plots` (`id`, `number`, `size_sq_ft`, `dimensions`, `facing`, `road_width`, `rate_per_sq_ft`, `status`, `feature`) VALUES
('plot-a1', 'A-101', 1000, '25 × 40 ft', 'East', '30 ft Internal', 1400.00, 'Available', 'Ideal for 3BHK compact luxury independent duplex.'),
('plot-a2', 'A-102', 1000, '25 × 40 ft', 'North', '30 ft Internal', 1400.00, 'Fast Selling', 'Vastu-compliant entrance with clear morning sunlight.'),
('plot-b1', 'B-201', 1200, '30 × 40 ft', 'Park Facing', '30 ft Internal', 1400.00, 'Fast Selling', 'Direct unobstructed view of central green park & jogging trail.'),
('plot-b2', 'B-205', 1500, '30 × 50 ft', 'East', '30 ft Internal', 1400.00, 'Available', 'Generous frontage for double-car porch and front garden.'),
('plot-c1', 'C-301', 2000, '40 × 50 ft', 'Park Facing', '40 ft Boulevard', 1400.00, 'Available', 'Premium estate plot overlooking clubhouse & landscaped water body.'),
('plot-c2', 'C-308', 2000, '40 × 50 ft', 'Boulevard Corner', '40 ft × 30 ft Dual Road', 1450.00, 'Fast Selling', 'Two-side open corner plot with grand boulevard visibility.'),
('plot-d1', 'D-401', 3000, '50 × 60 ft', 'Boulevard Corner', '40 ft Main Avenue', 1450.00, 'Reserved', 'Ultra-luxury mansion plot with private swimming pool clearance.'),
('plot-d2', 'D-405', 1000, '25 × 40 ft', 'North', '30 ft Internal', 1400.00, 'Available', 'Prime location near security entrance and visitor parking.');

-- --------------------------------------------------------------------
-- Table structure for table `inquiries`
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `inquiries`;
CREATE TABLE `inquiries` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `plot_preference` VARCHAR(100) NOT NULL DEFAULT '1000 sq ft',
  `visit_date` DATE DEFAULT NULL,
  `slot` VARCHAR(50) NOT NULL DEFAULT 'Morning (10:00 AM)',
  `cab_pickup` TINYINT(1) NOT NULL DEFAULT 0,
  `pickup_location` VARCHAR(150) NOT NULL DEFAULT 'Self Drive',
  `message` TEXT DEFAULT NULL,
  `status` ENUM('New', 'Contacted', 'Visit Scheduled', 'Site Visit Done', 'Booked') NOT NULL DEFAULT 'New',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inquiry_phone` (`phone`),
  KEY `idx_inquiry_status` (`status`),
  KEY `idx_inquiry_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Dumping data for table `inquiries`
-- --------------------------------------------------------------------
INSERT INTO `inquiries` (`id`, `name`, `phone`, `email`, `plot_preference`, `visit_date`, `slot`, `cab_pickup`, `pickup_location`, `message`, `status`, `created_at`) VALUES
('GG-2026-1042', 'Rajeshwar Mehrotra', '9839012450', 'r.mehrotra@lucknowtextiles.in', '2000 sq ft (Corner East Facing)', '2026-09-24', 'Morning (10:00 AM)', 1, 'Amausi Airport (CCSIA)', 'Looking for immediate registration. Want corner plot facing green belt.', 'Visit Scheduled', '2026-09-21 09:30:00'),
('GG-2026-1041', 'Dr. Ananya Srivastava', '9415087321', 'dr.ananya@apollomedics.org', '1500 sq ft', '2026-09-22', 'Evening Sunset (4:30 PM)', 0, 'Self Drive', 'Interested in building a 2-storey doctor residence. Verify SBI bank loan approval.', 'Contacted', '2026-09-20 17:15:00'),
('GG-2026-1039', 'Col. Pradeep Verma (Retd.)', '9198765432', 'pradeep.verma1968@gmail.com', '1000 sq ft', '2026-09-25', 'Morning (10:00 AM)', 1, 'Amausi Metro Station', 'Retirement home plot. Preferred near gated entrance security.', 'New', '2026-09-20 11:00:00');

-- --------------------------------------------------------------------
-- Table structure for table `admin_config`
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS `admin_config`;
CREATE TABLE `admin_config` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `google_sheets_webhook_url` VARCHAR(255) DEFAULT '',
  `dealer_pin` VARCHAR(32) NOT NULL DEFAULT '9044',
  `base_rate_per_sq_ft` DECIMAL(10, 2) NOT NULL DEFAULT 1400.00,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- Dumping data for table `admin_config`
-- --------------------------------------------------------------------
INSERT INTO `admin_config` (`id`, `google_sheets_webhook_url`, `dealer_pin`, `base_rate_per_sq_ft`) VALUES
(1, '', '9044', 1400.00);

SET FOREIGN_KEY_CHECKS = 1;
