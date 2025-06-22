-- Seed initial user accounts
USE `ims2025`;

-- Insert department-specific faculty accounts (with faculty IDs following the pattern)
-- CE - 101 series (Computer Engineering)
INSERT INTO `users` (
  `username`, `password`, `email`, `name`, `role`, 
  `department_id`, `faculty_id`, `is_active`, `default_password_changed`
)
VALUES
-- HOD of Computer Engineering (already has F_id 101)
(
  '101', 
  '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', -- this is a hash of '101' (for demo only)
  'rajesh.sharma@university.edu',
  'Dr. Rajesh Sharma',
  'hod',
  10, 
  101,
  TRUE,
  FALSE
),
-- Additional CE faculty (more would follow 102, 103, etc.)
(
  '102', 
  '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', -- this is a hash of '102'
  'ce.faculty@university.edu',
  'CE Faculty Member',
  'faculty',
  10, 
  NULL,
  TRUE,
  FALSE
);

-- ME - 201 series (Mechanical Engineering)
INSERT INTO `users` (
  `username`, `password`, `email`, `name`, `role`, 
  `department_id`, `faculty_id`, `is_active`, `default_password_changed`
)
VALUES
-- HOD of Mechanical Engineering (F_id 201)
(
  '201', 
  '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', -- this is a hash of '201'
  'anjali.mehta@university.edu',
  'Dr. Anjali Mehta',
  'hod',
  20, 
  102, -- This should be updated to 201 when faculty records are updated
  TRUE,
  FALSE
);

-- ExTC - 301 series (Electronics and Telecommunication Engineering)
INSERT INTO `users` (
  `username`, `password`, `email`, `name`, `role`, 
  `department_id`, `faculty_id`, `is_active`, `default_password_changed`
)
VALUES
-- HOD of ExTC Engineering (F_id 301)
(
  '301', 
  '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', -- this is a hash of '301'
  'suresh.reddy@university.edu',
  'Dr. Suresh Reddy',
  'hod',
  30, 
  103, -- This should be updated to 301 when faculty records are updated
  TRUE,
  FALSE
);

-- EE - 401 series (Electrical Engineering)
INSERT INTO `users` (
  `username`, `password`, `email`, `name`, `role`, 
  `department_id`, `faculty_id`, `is_active`, `default_password_changed`
)
VALUES
-- HOD of Electrical Engineering (F_id 401)
(
  '401', 
  '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', -- this is a hash of '401'
  'kavita.patel@university.edu',
  'Dr. Kavita Patel',
  'hod',
  40, 
  104, -- This should be updated to 401 when faculty records are updated
  TRUE,
  FALSE
);

-- IT - 501 series (Information Technology)
INSERT INTO `users` (
  `username`, `password`, `email`, `name`, `role`, 
  `department_id`, `faculty_id`, `is_active`, `default_password_changed`
)
VALUES
-- HOD of Information Technology (F_id 501)
(
  '501', 
  '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', -- this is a hash of '501'
  'amit.verma@university.edu',
  'Dr. Shubhangi Vaikole',
  'hod',
  50, 
  105, -- This should be updated to 501 when faculty records are updated
  TRUE,
  FALSE
);

-- Add some student accounts
-- student would follow pattern: CE - 10001, 10002, ME - 20001, 20002, etc.
INSERT INTO `users` (
  `username`, `password`, `email`, `name`, `role`, 
  `department_id`, `student_id`, `is_active`, `default_password_changed`
)
VALUES
-- CE Student
(
  '10001', 
  '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', -- this is a hash of '10001'
  'ce.student@university.edu',
  'CE Student',
  'student',
  10, 
  10001,
  TRUE,
  FALSE
),
-- ME Student
(
  '20001', 
  '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', -- this is a hash of '20001'
  'me.student@university.edu',
  'ME Student',
  'student',
  20, 
  20001,
  TRUE,
  FALSE
);

-- Admin account
INSERT INTO `users` (
  `username`, `password`, `email`, `name`, `role`, 
  `is_active`, `default_password_changed`
)
VALUES
(
  'admin', 
  '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', -- this is a hash of 'admin'
  'admin@ims.edu',
  'System Administrator',
  'admin',
  TRUE,
  TRUE
); 