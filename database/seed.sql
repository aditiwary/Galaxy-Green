-- =========================================================
-- Galaxy Green Sai Suraksha Nagar - Seed Data
-- =========================================================

USE `galaxy_green`;

-- ---------------------------------------------------------
-- Seed: plots
-- ---------------------------------------------------------
INSERT INTO `plots` (`id`, `number`, `size_sq_ft`, `dimensions`, `facing`, `road_width`, `rate_per_sq_ft`, `status`, `feature`)
VALUES
  ('plot-a1', 'A-101', 1000, '25 × 40 ft', 'East', '30 ft Internal', 1400.00, 'Available', 'Ideal for 3BHK compact luxury independent duplex.'),
  ('plot-a2', 'A-102', 1000, '25 × 40 ft', 'North', '30 ft Internal', 1400.00, 'Fast Selling', 'Vastu-compliant entrance with clear morning sunlight.'),
  ('plot-b1', 'B-201', 1200, '30 × 40 ft', 'Park Facing', '30 ft Internal', 1400.00, 'Fast Selling', 'Direct unobstructed view of central green park & jogging trail.'),
  ('plot-b2', 'B-205', 1500, '30 × 50 ft', 'East', '30 ft Internal', 1400.00, 'Available', 'Generous frontage for double-car porch and front garden.'),
  ('plot-c1', 'C-301', 2000, '40 × 50 ft', 'Park Facing', '40 ft Boulevard', 1400.00, 'Available', 'Premium estate plot overlooking clubhouse & landscaped water body.'),
  ('plot-c2', 'C-308', 2000, '40 × 50 ft', 'Boulevard Corner', '40 ft × 30 ft Dual Road', 1450.00, 'Fast Selling', 'Two-side open corner plot with grand boulevard visibility.'),
  ('plot-d1', 'D-401', 3000, '50 × 60 ft', 'Boulevard Corner', '40 ft Main Avenue', 1450.00, 'Reserved', 'Ultra-luxury mansion plot with private swimming pool clearance.'),
  ('plot-d2', 'D-405', 1000, '25 × 40 ft', 'North', '30 ft Internal', 1400.00, 'Available', 'Prime location near security entrance and visitor parking.')
ON DUPLICATE KEY UPDATE
  `size_sq_ft` = VALUES(`size_sq_ft`),
  `dimensions` = VALUES(`dimensions`),
  `facing` = VALUES(`facing`),
  `road_width` = VALUES(`road_width`),
  `rate_per_sq_ft` = VALUES(`rate_per_sq_ft`),
  `status` = VALUES(`status`),
  `feature` = VALUES(`feature`);

-- ---------------------------------------------------------
-- Seed: inquiries (Leads)
-- ---------------------------------------------------------
INSERT INTO `inquiries` (`id`, `name`, `phone`, `email`, `plot_preference`, `visit_date`, `slot`, `cab_pickup`, `pickup_location`, `message`, `status`, `created_at`)
VALUES
  ('GG-2026-1042', 'Rajeshwar Mehrotra', '9839012450', 'r.mehrotra@lucknowtextiles.in', '2000 sq ft (Corner East Facing)', '2026-09-24', 'Morning (10:00 AM)', 1, 'Amausi Airport (CCSIA)', 'Looking for immediate registration. Want corner plot facing green belt.', 'Visit Scheduled', '2026-09-21 09:30:00'),
  ('GG-2026-1041', 'Dr. Ananya Srivastava', '9415087321', 'dr.ananya@apollomedics.org', '1500 sq ft', '2026-09-22', 'Evening Sunset (4:30 PM)', 0, 'Self Drive', 'Interested in building a 2-storey doctor residence. Verify SBI bank loan approval.', 'Contacted', '2026-09-20 17:15:00'),
  ('GG-2026-1039', 'Col. Pradeep Verma (Retd.)', '9198765432', 'pradeep.verma1968@gmail.com', '1000 sq ft', '2026-09-25', 'Morning (10:00 AM)', 1, 'Amausi Metro Station', 'Retirement home plot. Preferred near gated entrance security.', 'New', '2026-09-20 11:00:00')
ON DUPLICATE KEY UPDATE
  `status` = VALUES(`status`);

-- ---------------------------------------------------------
-- Seed: admin_config
-- ---------------------------------------------------------
INSERT INTO `admin_config` (`id`, `google_sheets_webhook_url`, `dealer_pin`, `base_rate_per_sq_ft`)
VALUES (1, '', '9044', 1400.00)
ON DUPLICATE KEY UPDATE
  `dealer_pin` = VALUES(`dealer_pin`),
  `base_rate_per_sq_ft` = VALUES(`base_rate_per_sq_ft`);
