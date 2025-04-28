-- User Authentication Tables
USE `ims2025`;

-- Create Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `name` VARCHAR(100) NULL,
  `role` ENUM('admin', 'hod', 'faculty', 'staff', 'student') NOT NULL DEFAULT 'faculty',
  `department_id` INT NULL,
  `faculty_id` BIGINT NULL,
  `student_id` BIGINT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` TIMESTAMP NULL,
  `default_password_changed` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC),
  CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`Department_ID`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`F_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create Permissions Table
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create Role-Permission Mapping Table
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `role` ENUM('admin', 'hod', 'faculty', 'staff', 'student') NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `role_permission_UNIQUE` (`role` ASC, `permission_id` ASC),
  CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert base permissions
INSERT INTO `permissions` (`name`, `description`) VALUES
-- Faculty-related permissions
('faculty_read', 'View faculty information'),
('faculty_create', 'Create new faculty records'),
('faculty_update', 'Update faculty information'),
('faculty_delete', 'Delete faculty records'),
('faculty_self_update', 'Update own faculty profile'),

-- Department-related permissions
('department_read', 'View department information'),
('department_create', 'Create new departments'),
('department_update', 'Update department information'),
('department_delete', 'Delete departments'),
('department_manage_faculty', 'Assign/remove faculty from departments'),

-- Student-related permissions
('student_read', 'View student information'),
('student_create', 'Create new student records'),
('student_update', 'Update student information'),
('student_delete', 'Delete student records'),
('student_self_update', 'Update own student profile'),

-- Course-related permissions
('course_read', 'View course information'),
('course_create', 'Create new courses'),
('course_update', 'Update course information'),
('course_delete', 'Delete courses'),
('course_enrollment', 'Manage course enrollments'),

-- Administrative permissions
('user_read', 'View user accounts'),
('user_create', 'Create user accounts'),
('user_update', 'Update user accounts'),
('user_delete', 'Delete user accounts'),
('user_self_update', 'Update own user account'),
('settings_read', 'View system settings'),
('settings_update', 'Update system settings'),
('reports_view', 'View system reports'),
('reports_generate', 'Generate new reports'),
('dashboard_view', 'View dashboard');

-- Assign permissions to roles
-- Admin role (has all permissions)
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT 'admin', id FROM `permissions`;

-- HOD role
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT 'hod', id FROM `permissions` WHERE `name` IN (
  'faculty_read', 'faculty_create', 'faculty_update', 'faculty_self_update',
  'department_read', 'department_update', 'department_manage_faculty',
  'student_read', 'student_create', 'student_update',
  'course_read', 'course_create', 'course_update', 'course_enrollment',
  'user_self_update', 'reports_view', 'dashboard_view'
);

-- Faculty role
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT 'faculty', id FROM `permissions` WHERE `name` IN (
  'faculty_read', 'faculty_self_update',
  'department_read',
  'student_read',
  'course_read', 'course_enrollment',
  'user_self_update', 'dashboard_view'
);

-- Staff role
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT 'staff', id FROM `permissions` WHERE `name` IN (
  'faculty_read',
  'department_read',
  'student_read', 'student_create', 'student_update',
  'course_read', 'course_update', 'course_enrollment',
  'user_self_update', 'dashboard_view'
);

-- Student role
INSERT INTO `role_permissions` (`role`, `permission_id`)
SELECT 'student', id FROM `permissions` WHERE `name` IN (
  'faculty_read',
  'department_read',
  'student_self_update',
  'course_read',
  'user_self_update', 'dashboard_view'
); 