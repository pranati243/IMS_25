-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 01, 2025 at 08:39 AM
-- Server version: 8.0.34
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ims2025iii`
--

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `Department_ID` int NOT NULL,
  `Department_Name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `department`
--

INSERT INTO `department` (`Department_ID`, `Department_Name`) VALUES
(10, 'Computer Engineering'),
(20, 'Mechanical Engineering'),
(30, 'Electronics and Telecommunication Engineering'),
(40, 'Electrical Engineering'),
(50, 'Information Technology');

-- --------------------------------------------------------

--
-- Table structure for table `department_details`
--

CREATE TABLE `department_details` (
  `Department_ID` int NOT NULL,
  `Establishment_Year` year NOT NULL,
  `Department_Code` varchar(50) NOT NULL,
  `Email_ID` varchar(255) NOT NULL,
  `Department_Phone_Number` varchar(15) NOT NULL,
  `HOD_ID` bigint DEFAULT NULL,
  `Vision` text,
  `Mission` text,
  `Total_Faculty` int DEFAULT NULL,
  `Total_Students` int DEFAULT NULL,
  `Website_URL` varchar(255) DEFAULT NULL,
  `Notable_Achievements` text,
  `Industry_Collaboration` text,
  `Research_Focus_Area` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `department_details`
--

INSERT INTO `department_details` (`Department_ID`, `Establishment_Year`, `Department_Code`, `Email_ID`, `Department_Phone_Number`, `HOD_ID`, `Vision`, `Mission`, `Total_Faculty`, `Total_Students`, `Website_URL`, `Notable_Achievements`, `Industry_Collaboration`, `Research_Focus_Area`) VALUES
(10, '2005', 'CSE-101', 'cse@university.edu', '1234567890', NULL, 'To excel in computer education', 'Empowering students with programming skills', 25, 500, 'https://cse.university.edu', 'Ranked top 5 in national coding competitions', 'Partnership with Google and Microsoft', 'Artificial Intelligence, Cybersecurity'),
(30, '2002', 'ECE-103', 'ece@university.edu', '1234567892', NULL, 'Enhancing communication technology', 'Pioneering research in electronics', 22, 400, 'https://ece.university.edu', 'Students won national circuit design competition', 'MoU with semiconductor companies', 'VLSI, Embedded Systems'),
(40, '1995', 'EE-104', 'ee@university.edu', '1234567893', NULL, 'To electrify the world sustainably', 'Creating energy-efficient solutions', 20, 300, 'https://ee.university.edu', 'Developed a smart grid prototype', 'Collaboration with power industries', 'Renewable Energy, Power Systems'),
(50, '2008', 'IT-105', 'it@university.edu', '1234567894', NULL, 'Advancing IT education and research', 'Focusing on real-world applications of IT', 15, 250, 'https://it.university.edu', 'Students won Hackathon 2024', 'MoU with top software companies', 'Cloud Computing, Data Analytics'),
(20, '1998', 'ME-102', 'me@university.edu', '1234567891', NULL, 'To innovate in mechanical solutions', 'Building the engineers of tomorrow', 18, 350, 'https://me.university.edu', 'Developed a patented turbine design', 'Collaboration with automobile industry leaders', 'Thermal Engineering, Robotics');

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `F_id` bigint NOT NULL,
  `F_name` varchar(255) NOT NULL,
  `F_dept` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`F_id`, `F_name`, `F_dept`) VALUES
(111, 'Dr. Lata Ragha', 'Computer Engineering'),
(112, 'Dr. M. Kiruthika', 'Computer Engineering'),
(113, 'Dr. Jyoti More', 'Computer Engineering'),
(114, 'Dr. Chhaya Pawar', 'Computer Engineering'),
(115, 'Mr. Amroz Siddique', 'Computer Engineering'),
(116, 'Dr. Smita Dange', 'Computer Engineering'),
(117, 'Ms. Rakhi Kalantri', 'Computer Engineering'),
(118, 'Ms. Shagufta Rajguru', 'Computer Engineering'),
(119, 'Ms. Kavita Shelke', 'Computer Engineering'),
(120, 'Ms. Dakshayani', 'Computer Engineering'),
(121, 'Mr. Mritunjay Ojha', 'Computer Engineering'),
(122, 'Mr. Rahul Jadhav', 'Computer Engineering'),
(123, 'Ms. Smita Rukhande', 'Computer Engineering'),
(124, 'Ms. Priyamvada Singh', 'Computer Engineering'),
(125, 'Dr. Pravin Rahate', 'Computer Engineering'),
(126, 'Ms. Nupur Gaikwad', 'Computer Engineering'),
(127, 'Ms. Prachi Verma', 'Computer Engineering'),
(128, 'Ms. Bharati K.', 'Computer Engineering'),
(129, 'Ms. Bhakti Aher', 'Computer Engineering'),
(130, 'Ms Vidya Kothari', 'Computer Engineering'),
(131, 'Ms. Ujala Patil', 'Computer Engineering'),
(132, 'Ms. Rohini Deshpande', 'Computer Engineering'),
(133, 'Mr. Raj Mahesh Ramchandani', 'Computer Engineering'),
(134, 'Mrs. Neelam Joshi', 'Computer Engineering'),
(135, 'Ms. Shalaka Deshpande', 'Computer Engineering');

-- --------------------------------------------------------

--
-- Table structure for table `faculty_contributions`
--

CREATE TABLE `faculty_contributions` (
  `F_ID` bigint NOT NULL,
  `Contribution_Type` varchar(255) NOT NULL,
  `Description` text NOT NULL,
  `Contribution_Date` date NOT NULL,
  `Recognized_By` varchar(255) DEFAULT NULL,
  `Award_Received` varchar(255) DEFAULT NULL,
  `Documents_Attached` blob,
  `Remarks` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_details`
--

CREATE TABLE `faculty_details` (
  `F_ID` bigint DEFAULT NULL,
  `Email` varchar(255) NOT NULL,
  `Phone_Number` varchar(15) NOT NULL,
  `PAN_Number` varchar(10) NOT NULL,
  `Aadhaar_Number` varchar(12) DEFAULT NULL,
  `Highest_Degree` varchar(255) NOT NULL,
  `Area_of_Certification` text,
  `Date_of_Joining` date NOT NULL,
  `Experience` int DEFAULT NULL,
  `Past_Experience` text,
  `Future_Experience_Calculated` int DEFAULT NULL,
  `Age` int DEFAULT NULL,
  `Other_Experience` text,
  `Resignation_at_Joining` text,
  `Current_Designation` varchar(255) DEFAULT NULL,
  `Photo` blob,
  `Date_Appointed_as_Professor` date DEFAULT NULL,
  `Professor_of_Other_Institution` text,
  `Date_of_Birth` date NOT NULL,
  `Detailed_ID` text,
  `Various_Other_Info` text,
  `Nature_of_Association` text,
  `Regular_Contribution` text,
  `apaar_id` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `faculty_details`
--

INSERT INTO `faculty_details` (`F_ID`, `Email`, `Phone_Number`, `PAN_Number`, `Aadhaar_Number`, `Highest_Degree`, `Area_of_Certification`, `Date_of_Joining`, `Experience`, `Past_Experience`, `Future_Experience_Calculated`, `Age`, `Other_Experience`, `Resignation_at_Joining`, `Current_Designation`, `Photo`, `Date_Appointed_as_Professor`, `Professor_of_Other_Institution`, `Date_of_Birth`, `Detailed_ID`, `Various_Other_Info`, `Nature_of_Association`, `Regular_Contribution`, `apaar_id`) VALUES
(115, 'amroz.siddique@fcrit.ac.in', '9876543219', 'AXJPS9908D', '556677889900', 'M. Tech (Comp)', 'Web Application', '2003-07-08', 22, NULL, NULL, 45, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1980-04-05', NULL, NULL, 'Regular', NULL, NULL),
(129, 'bhakti.aher@fcrit.ac.in', '9876543233', 'BHTPS9884F', '990011223388', 'ME (COMP)', 'Social Media Analytics', '2022-08-03', 3, NULL, NULL, 31, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1994-04-25', NULL, NULL, 'Contract', NULL, NULL),
(128, 'bharati.k@fcrit.ac.in', '9876543232', 'ADUPJ6563E', '889900112277', 'M.E. (Electrics)', 'Power Electronics', '2022-07-21', 3, NULL, NULL, 32, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1993-12-20', NULL, NULL, 'Contract', NULL, NULL),
(114, 'chhaya.pawar@fcrit.ac.in', '9876543218', 'AKCPD6570A', '445566778899', 'Ph. D', 'Artificial Intelligence', '2022-11-01', 3, NULL, NULL, 43, NULL, NULL, 'Associate Professor', NULL, NULL, NULL, '1982-11-25', NULL, NULL, 'Regular', NULL, NULL),
(120, 'dakshayani@fcrit.ac.in', '9876543224', 'APNPG7656Q', '001122334455', 'M.E (Comp)', 'Data Science', '2007-08-31', 18, NULL, NULL, 45, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1980-06-18', NULL, NULL, 'Regular', NULL, NULL),
(113, 'jyoti.more@fcrit.ac.in', '9876543217', 'BKQPS3452K', '334455667788', 'Ph. D', 'Networks', '2022-02-02', 3, NULL, NULL, 40, NULL, NULL, 'Associate Professor', NULL, NULL, NULL, '1985-03-10', NULL, NULL, 'Regular', NULL, NULL),
(119, 'kavita.shelke@fcrit.ac.in', '9876543223', 'BTXPS9598A', '990011223344', 'M.E (Comp)', 'Networking', '2007-08-27', 18, NULL, NULL, 44, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1981-12-14', NULL, NULL, 'Regular', NULL, NULL),
(111, 'lata.ragha@fcrit.ac.in', '9876543215', 'ABKPR9379N', '112233445566', 'Ph. D', 'Network Security', '2016-12-21', 9, NULL, NULL, 50, NULL, NULL, 'Professor', NULL, NULL, NULL, '1975-05-15', NULL, NULL, 'Regular', NULL, NULL),
(112, 'm.kiruthika@fcrit.ac.in', '9876543216', 'AEWPK3412N', '223344556677', 'Ph. D', 'Data Mining', '1997-07-02', 28, NULL, NULL, 55, NULL, NULL, 'Associate Professor', NULL, NULL, NULL, '1970-08-20', NULL, NULL, 'Regular', NULL, NULL),
(121, 'mritunjay.ojha@fcrit.ac.in', '9876543225', 'AAOPO9845K', '112233445500', 'M.E (Comp)', 'Computer Network', '2008-07-28', 17, NULL, NULL, 43, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1982-04-09', NULL, NULL, 'Regular', NULL, NULL),
(134, 'neelam.joshi@fcrit.ac.in', '9876543238', 'AODPJ4975Q', '445566778844', 'M. Tech (CSE)', 'Software Engineering', '2024-07-10', 1, NULL, NULL, 26, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1999-06-18', NULL, NULL, 'Contract', NULL, NULL),
(126, 'nupur.gaikwad@fcrit.ac.in', '9876543230', 'CKUPG1596B', '667788990055', 'ME (Comp)', 'Networking', '2022-07-20', 3, NULL, NULL, 33, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1992-10-10', NULL, NULL, 'Contract', NULL, NULL),
(127, 'prachi.verma@fcrit.ac.in', '9876543231', 'AOCPV9816K', '778899001166', 'M. Tech (Adv. Computing)', 'Cloud Computing', '2022-07-15', 3, NULL, NULL, 34, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1991-11-05', NULL, NULL, 'Contract', NULL, NULL),
(125, 'pravin.rahate@fcrit.ac.in', '9876543229', 'AIBPR0094C', '556677889944', 'Ph. D', 'Deep Learning', '2022-11-01', 3, NULL, NULL, 37, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1988-07-03', NULL, NULL, 'Regular', NULL, NULL),
(124, 'priyamvada.singh@fcrit.ac.in', '9876543228', 'EHEPS3732Q', '445566778833', 'M. Tech (IT)', 'Semantic Web', '2021-08-16', 4, NULL, NULL, 35, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1990-02-14', NULL, NULL, 'Regular', NULL, NULL),
(122, 'rahul.jadhav@fcrit.ac.in', '9876543226', 'AJFPJ3223J', '223344556611', 'M.E (Comp)', 'Data Science', '2008-12-23', 17, NULL, NULL, 42, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1983-05-19', NULL, NULL, 'Regular', NULL, NULL),
(133, 'raj.ramchandani@fcrit.ac.in', '9876543237', 'CAQPR9276K', '334455667733', 'MS (Data Science)', 'Data Science', '2024-07-01', 1, NULL, NULL, 27, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1998-01-05', NULL, NULL, 'Contract', NULL, NULL),
(117, 'rakhi.kalantri@fcrit.ac.in', '9876543221', 'AWUPK0316K', '778899001122', 'M.E (Comp)', 'Cyber Security', '2007-06-01', 18, NULL, NULL, 42, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1983-07-22', NULL, NULL, 'Regular', NULL, NULL),
(132, 'rohini.deshpande@fcrit.ac.in', '9876543236', 'AKQPD6228H', '223344556622', 'ME (EXTC)', 'Wireless Comm', '2023-07-10', 2, NULL, NULL, 28, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1997-08-11', NULL, NULL, 'Contract', NULL, NULL),
(118, 'shagufta.rajguru@fcrit.ac.in', '9876543222', 'AMEPR2948G', '889900112233', 'M.E (Comp)', 'Computer Security', '2007-07-13', 18, NULL, NULL, 41, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1984-01-30', NULL, NULL, 'Regular', NULL, NULL),
(135, 'shalaka.deshpande@fcrit.ac.in', '9876543239', 'CJLPD8105K', '556677889955', 'ME (Embedded Systems)', 'Embedded System', '2024-07-31', 1, NULL, NULL, 25, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '2000-12-25', NULL, NULL, 'Contract', NULL, NULL),
(116, 'smita.dange@fcrit.ac.in', '9876543220', 'AKUPM5516F', '667788990011', 'Ph. D', 'IOT, ML and Data Analytics', '2004-07-05', 21, NULL, NULL, 47, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1978-09-12', NULL, NULL, 'Regular', NULL, NULL),
(123, 'smita.rukhande@fcrit.ac.in', '9876543227', 'AMVPR5107Q', '334455667722', 'ME (COMP)', 'Security', '2009-04-08', 16, NULL, NULL, 40, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1985-08-27', NULL, NULL, 'Regular', NULL, NULL),
(131, 'ujala.patil@fcrit.ac.in', '9876543235', 'CIAPP5264K', '112233445511', 'M. Tech (CSC)', 'Cloud Computing', '2023-07-04', 2, NULL, NULL, 29, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1996-03-22', NULL, NULL, 'Contract', NULL, NULL),
(130, 'vidya.kothari@fcrit.ac.in', '9876543234', 'DIWPK8357P', '001122334499', 'ME(COMP)', 'Image Processing', '2023-07-04', 2, NULL, NULL, 30, NULL, NULL, 'Assistant Professor', NULL, NULL, NULL, '1995-09-15', NULL, NULL, 'Contract', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `faculty_professional_body`
--

CREATE TABLE `faculty_professional_body` (
  `Professional_Body_ID` int DEFAULT NULL,
  `F_ID` bigint DEFAULT NULL,
  `Professional_Body_Name` varchar(150) NOT NULL,
  `Membership_Level` enum('National','International') NOT NULL,
  `Joining_Date` date NOT NULL,
  `Validity_Date` date DEFAULT NULL,
  `Initial_Grade` varchar(50) DEFAULT NULL,
  `Membership_Grade` varchar(100) DEFAULT NULL,
  `Membership_Number` varchar(50) DEFAULT NULL,
  `Unique_ID` varchar(50) DEFAULT NULL,
  `Contributions` text,
  `Attachment_Document` blob,
  `Position` varchar(100) DEFAULT NULL,
  `Official_Role` text,
  `Attendee_Count` smallint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_qualifications`
--

CREATE TABLE `faculty_qualifications` (
  `f_id` bigint NOT NULL,
  `highest_degree` varchar(100) NOT NULL,
  `year_obtained` year NOT NULL,
  `university` varchar(150) NOT NULL,
  `certificate_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_resource_person`
--

CREATE TABLE `faculty_resource_person` (
  `F_ID` bigint NOT NULL,
  `Program_Type` varchar(255) DEFAULT NULL,
  `Program_Name` varchar(255) DEFAULT NULL,
  `Event_Date` date NOT NULL,
  `Event_Duration` varchar(255) DEFAULT NULL,
  `Location` varchar(255) DEFAULT NULL,
  `Event_Mode` varchar(100) DEFAULT NULL,
  `Organized_By` varchar(255) DEFAULT NULL,
  `Faculty_Role` varchar(255) DEFAULT NULL,
  `Topics_Covered` text,
  `Certificate_Issued` tinyint(1) DEFAULT '0',
  `Certificate_Upload` blob,
  `Remarks` text,
  `Event_Status` text,
  `Faculty_Name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `description`) VALUES
(1, 'faculty_read', 'View faculty information'),
(2, 'faculty_create', 'Create new faculty records'),
(3, 'faculty_update', 'Update faculty information'),
(4, 'faculty_delete', 'Delete faculty records'),
(5, 'faculty_self_update', 'Update own faculty profile'),
(6, 'department_read', 'View department information'),
(7, 'department_create', 'Create new departments'),
(8, 'department_update', 'Update department information'),
(9, 'department_delete', 'Delete departments'),
(10, 'department_manage_faculty', 'Assign/remove faculty from departments'),
(11, 'student_read', 'View student information'),
(12, 'student_create', 'Create new student records'),
(13, 'student_update', 'Update student information'),
(14, 'student_delete', 'Delete student records'),
(15, 'student_self_update', 'Update own student profile'),
(16, 'course_read', 'View course information'),
(17, 'course_create', 'Create new courses'),
(18, 'course_update', 'Update course information'),
(19, 'course_delete', 'Delete courses'),
(20, 'course_enrollment', 'Manage course enrollments'),
(21, 'user_read', 'View user accounts'),
(22, 'user_create', 'Create user accounts'),
(23, 'user_update', 'Update user accounts'),
(24, 'user_delete', 'Delete user accounts'),
(25, 'user_self_update', 'Update own user account'),
(26, 'settings_read', 'View system settings'),
(27, 'settings_update', 'Update system settings'),
(28, 'reports_view', 'View system reports'),
(29, 'reports_generate', 'Generate new reports'),
(30, 'dashboard_view', 'View dashboard');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int NOT NULL,
  `role` enum('admin','hod','faculty','staff','student') NOT NULL,
  `permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role`, `permission_id`) VALUES
(14, 'admin', 1),
(12, 'admin', 2),
(16, 'admin', 3),
(13, 'admin', 4),
(15, 'admin', 5),
(10, 'admin', 6),
(7, 'admin', 7),
(11, 'admin', 8),
(8, 'admin', 9),
(9, 'admin', 10),
(23, 'admin', 11),
(21, 'admin', 12),
(25, 'admin', 13),
(22, 'admin', 14),
(24, 'admin', 15),
(4, 'admin', 16),
(1, 'admin', 17),
(5, 'admin', 18),
(2, 'admin', 19),
(3, 'admin', 20),
(28, 'admin', 21),
(26, 'admin', 22),
(30, 'admin', 23),
(27, 'admin', 24),
(29, 'admin', 25),
(19, 'admin', 26),
(20, 'admin', 27),
(18, 'admin', 28),
(17, 'admin', 29),
(6, 'admin', 30),
(41, 'hod', 1),
(40, 'hod', 2),
(43, 'hod', 3),
(42, 'hod', 5),
(38, 'hod', 6),
(39, 'hod', 8),
(37, 'hod', 10),
(46, 'hod', 11),
(45, 'hod', 12),
(47, 'hod', 13),
(34, 'hod', 16),
(32, 'hod', 17),
(35, 'hod', 18),
(33, 'hod', 20),
(48, 'hod', 25),
(44, 'hod', 28),
(36, 'hod', 30),
(67, 'faculty', 1),
(68, 'faculty', 5),
(66, 'faculty', 6),
(69, 'faculty', 11),
(64, 'faculty', 16),
(63, 'faculty', 20),
(70, 'faculty', 25),
(65, 'faculty', 30),
(83, 'staff', 1),
(82, 'staff', 6),
(85, 'staff', 11),
(84, 'staff', 12),
(86, 'staff', 13),
(79, 'staff', 16),
(80, 'staff', 18),
(78, 'staff', 20),
(87, 'staff', 25),
(81, 'staff', 30),
(96, 'student', 1),
(95, 'student', 6),
(97, 'student', 15),
(93, 'student', 16),
(98, 'student', 25),
(94, 'student', 30);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `role` enum('admin','hod','faculty','staff','student') NOT NULL DEFAULT 'faculty',
  `department_id` int DEFAULT NULL,
  `faculty_id` bigint DEFAULT NULL,
  `student_id` bigint DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `default_password_changed` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `name`, `role`, `department_id`, `faculty_id`, `student_id`, `is_active`, `created_at`, `updated_at`, `last_login`, `default_password_changed`) VALUES
(1, '101', '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', 'rajesh.sharma@university.edu', 'Dr. Rajesh Sharma', 'hod', 10, NULL, NULL, 1, '2025-04-26 19:54:23', '2025-04-27 15:35:50', '2025-04-27 15:35:50', 0),
(2, '102', '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', 'ce.faculty@university.edu', 'CE Faculty Member', 'faculty', 10, NULL, NULL, 1, '2025-04-26 19:54:23', '2025-04-26 19:54:23', NULL, 0),
(3, '201', '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', 'anjali.mehta@university.edu', 'Dr. Anjali Mehta', 'hod', 20, NULL, NULL, 1, '2025-04-26 19:54:23', '2025-04-26 19:54:23', NULL, 0),
(4, '301', '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', 'suresh.reddy@university.edu', 'Dr. Suresh Reddy', 'hod', 30, NULL, NULL, 1, '2025-04-26 19:54:23', '2025-04-26 19:54:23', NULL, 0),
(5, '401', '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', 'kavita.patel@university.edu', 'Dr. Kavita Patel', 'hod', 40, NULL, NULL, 1, '2025-04-26 19:54:23', '2025-04-26 19:54:23', NULL, 0),
(6, '501', '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', 'amit.verma@university.edu', 'Dr. Shubhangi Vaikole', 'hod', 50, NULL, NULL, 1, '2025-04-26 19:54:23', '2025-04-26 19:54:23', NULL, 0),
(7, '10001', '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', 'ce.student@university.edu', 'CE Student', 'student', 10, NULL, 10001, 1, '2025-04-26 19:54:23', '2025-04-26 19:54:23', NULL, 0),
(8, '20001', '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', 'me.student@university.edu', 'ME Student', 'student', 20, NULL, 20001, 1, '2025-04-26 19:54:23', '2025-04-26 19:54:23', NULL, 0),
(9, 'admin', '$2b$10$n7GGUAtBBe3q7FGxnC93xeZ.PwERUwF2qOGdGm8xmgaAFANUaYYV6', 'admin@ims.edu', 'System Administrator', 'admin', NULL, NULL, NULL, 1, '2025-04-26 19:54:23', '2025-04-26 19:54:23', NULL, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`Department_ID`);

--
-- Indexes for table `department_details`
--
ALTER TABLE `department_details`
  ADD UNIQUE KEY `Department_Code` (`Department_Code`),
  ADD UNIQUE KEY `Email_ID` (`Email_ID`),
  ADD UNIQUE KEY `Department_Phone_Number` (`Department_Phone_Number`),
  ADD KEY `Department_ID` (`Department_ID`),
  ADD KEY `HOD_ID` (`HOD_ID`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`F_id`);

--
-- Indexes for table `faculty_contributions`
--
ALTER TABLE `faculty_contributions`
  ADD KEY `F_ID` (`F_ID`);

--
-- Indexes for table `faculty_details`
--
ALTER TABLE `faculty_details`
  ADD UNIQUE KEY `Email` (`Email`),
  ADD UNIQUE KEY `Phone_Number` (`Phone_Number`),
  ADD UNIQUE KEY `PAN_Number` (`PAN_Number`),
  ADD UNIQUE KEY `Aadhaar_Number` (`Aadhaar_Number`),
  ADD KEY `F_ID` (`F_ID`);

--
-- Indexes for table `faculty_professional_body`
--
ALTER TABLE `faculty_professional_body`
  ADD UNIQUE KEY `Membership_Number` (`Membership_Number`),
  ADD UNIQUE KEY `Unique_ID` (`Unique_ID`),
  ADD KEY `F_ID` (`F_ID`);

--
-- Indexes for table `faculty_qualifications`
--
ALTER TABLE `faculty_qualifications`
  ADD KEY `f_id` (`f_id`);

--
-- Indexes for table `faculty_resource_person`
--
ALTER TABLE `faculty_resource_person`
  ADD KEY `F_ID` (`F_ID`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name_UNIQUE` (`name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_permission_UNIQUE` (`role`,`permission_id`),
  ADD KEY `fk_role_permissions_permission` (`permission_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username_UNIQUE` (`username`),
  ADD UNIQUE KEY `email_UNIQUE` (`email`),
  ADD KEY `fk_users_department` (`department_id`),
  ADD KEY `fk_users_faculty` (`faculty_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `Department_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `F_id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=136;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `department_details`
--
ALTER TABLE `department_details`
  ADD CONSTRAINT `department_details_ibfk_1` FOREIGN KEY (`Department_ID`) REFERENCES `department` (`Department_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `department_details_ibfk_2` FOREIGN KEY (`HOD_ID`) REFERENCES `faculty` (`F_id`) ON DELETE SET NULL;

--
-- Constraints for table `faculty_contributions`
--
ALTER TABLE `faculty_contributions`
  ADD CONSTRAINT `faculty_contributions_ibfk_1` FOREIGN KEY (`F_ID`) REFERENCES `faculty` (`F_id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_details`
--
ALTER TABLE `faculty_details`
  ADD CONSTRAINT `faculty_details_ibfk_1` FOREIGN KEY (`F_ID`) REFERENCES `faculty` (`F_id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_professional_body`
--
ALTER TABLE `faculty_professional_body`
  ADD CONSTRAINT `faculty_professional_body_ibfk_1` FOREIGN KEY (`F_ID`) REFERENCES `faculty` (`F_id`) ON DELETE CASCADE;

--
-- Constraints for table `faculty_qualifications`
--
ALTER TABLE `faculty_qualifications`
  ADD CONSTRAINT `faculty_qualifications_ibfk_1` FOREIGN KEY (`f_id`) REFERENCES `faculty` (`F_id`);

--
-- Constraints for table `faculty_resource_person`
--
ALTER TABLE `faculty_resource_person`
  ADD CONSTRAINT `faculty_resource_person_ibfk_1` FOREIGN KEY (`F_ID`) REFERENCES `faculty` (`F_id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_role_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`Department_ID`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_users_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`F_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
