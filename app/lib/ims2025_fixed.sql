-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 25, 2025 at 06:10 PM
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
-- Database: `ims2025`
--

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `Department_ID` int NOT NULL AUTO_INCREMENT,
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
  `id` int NOT NULL AUTO_INCREMENT,
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

INSERT INTO `department_details` (`id`, `Department_ID`, `Establishment_Year`, `Department_Code`, `Email_ID`, `Department_Phone_Number`, `HOD_ID`, `Vision`, `Mission`, `Total_Faculty`, `Total_Students`, `Website_URL`, `Notable_Achievements`, `Industry_Collaboration`, `Research_Focus_Area`) VALUES
(6, 10, '2005', 'CE-101', 'ce@university.edu', '1234567890', 101, 'To excel in computer education', 'Empowering student with programming skills', 25, 500, 'https://ce.university.edu', 'Ranked top 5 in national coding competitions', 'Partnership with Google and Microsoft', 'Artificial Intelligence, Cybersecurity'),
(7, 20, '1998', 'ME-102', 'me@university.edu', '1234567891', 102, 'To innovate in mechanical solutions', 'Building the engineers of tomorrow', 18, 350, 'https://me.university.edu', 'Developed a patented turbine design', 'Collaboration with automobile industry leaders', 'Thermal Engineering, Robotics'),
(8, 30, '2002', 'ECE-103', 'ece@university.edu', '1234567892', 103, 'Enhancing communication technology', 'Pioneering research in electronics', 22, 400, 'https://ece.university.edu', 'student won national circuit design competition', 'MoU with semiconductor companies', 'VLSI, Embedded Systems'),
(9, 40, '1995', 'EE-104', 'ee@university.edu', '1234567893', 104, 'To electrify the world sustainably', 'Creating energy-efficient solutions', 20, 300, 'https://ee.university.edu', 'Developed a smart grid prototype', 'Collaboration with power industries', 'Renewable Energy, Power Systems'),
(10, 50, '2008', 'IT-105', 'it@university.edu', '1234567894', 105, 'Advancing IT education and research', 'Focusing on real-world applications of IT', 15, 250, 'https://it.university.edu', 'student won Hackathon 2024', 'MoU with top software companies', 'Cloud Computing, Data Analytics');

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `F_id` bigint NOT NULL AUTO_INCREMENT,
  `F_name` varchar(255) NOT NULL,
  `F_dept` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`F_id`, `F_name`, `F_dept`) VALUES
(101, 'Dr. Rajesh Sharma', 'Computer Engineering'),
(102, 'Dr. Anjali Mehta', 'Mechanical Engineering'),
(103, 'Dr. Suresh Reddy', 'Electronics and Telecommunication Engineering'),
(104, 'Dr. Kavita Patel', 'Electrical Engineering'),
(105, 'Dr. Shubhangi Vaikole', 'Information Technology');

-- --------------------------------------------------------

--
-- Table structure for table `faculty_contributions`
--

CREATE TABLE `faculty_contributions` (
  `Contribution_ID` int NOT NULL AUTO_INCREMENT,
  `F_ID` bigint NOT NULL,
  `Contribution_Type` varchar(255) NOT NULL,
  `Description` text NOT NULL,
  `Contribution_Date` date NOT NULL,
  `Recognized_By` varchar(255) DEFAULT NULL,
  `Award_Received` varchar(255) DEFAULT NULL,
  `Documents_Attached` blob,
  `Remarks` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `faculty_contributions`
--

INSERT INTO `faculty_contributions` (`Contribution_ID`, `F_ID`, `Contribution_Type`, `Description`, `Contribution_Date`, `Recognized_By`, `Award_Received`, `Documents_Attached`, `Remarks`) VALUES
(1, 101, 'Research Paper Publication', 'Published a paper on AI-driven analytics in IEEE Transactions', '2023-05-12', 'IEEE', 'Best Research Paper Award', NULL, 'Well received by the research community'),
(2, 102, 'Technical Workshop Speaker', 'Conducted a national-level workshop on Thermal Dynamics', '2022-11-20', 'National Science Forum', 'Excellence in Teaching Award', NULL, 'Highly appreciated by participants'),
(3, 103, 'Patent Filing', 'Filed a patent on a new VLSI design for energy-efficient chips', '2021-07-15', 'Patent Office of India', NULL, NULL, 'Patent under review'),
(4, 104, 'Industry Collaboration', 'Collaborated with XYZ Energy Corp for a smart grid project', '2023-02-18', 'XYZ Energy Corp', 'Outstanding Contribution Award', NULL, 'Successful pilot testing completed'),
(5, 105, 'Cybersecurity Panel Discussion', 'Invited as an expert panelist at the International Cybersecurity Summit', '2023-09-10', 'Global Cybersecurity Association', NULL, NULL, 'Shared insights on cloud security challenges'),
(6, 101, 'Book Publication', 'Published a book on Machine Learning for Beginners', '2022-04-05', 'Springer', 'Best Author Award', NULL, 'Used as a textbook in multiple universities'),
(7, 102, 'Journal Reviewer', 'Served as a reviewer for the International Journal of Mechanical Engineering', '2021-12-08', 'IJME Editorial Board', NULL, NULL, 'Reviewed 10+ research papers'),
(8, 104, 'Renewable Energy Research Grant', 'Secured a research grant for solar energy optimization studies', '2023-06-25', 'Government Research Council', 'Research Excellence Grant', NULL, 'Project underway with positive results');

-- --------------------------------------------------------

--
-- Table structure for table `faculty_details`
--

CREATE TABLE `faculty_details` (
  `Sr_No` int NOT NULL AUTO_INCREMENT,
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
  `Regular_Contribution` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `faculty_details`
--

INSERT INTO `faculty_details` (`Sr_No`, `F_ID`, `Email`, `Phone_Number`, `PAN_Number`, `Aadhaar_Number`, `Highest_Degree`, `Area_of_Certification`, `Date_of_Joining`, `Experience`, `Past_Experience`, `Future_Experience_Calculated`, `Age`, `Other_Experience`, `Resignation_at_Joining`, `Current_Designation`, `Photo`, `Date_Appointed_as_Professor`, `Professor_of_Other_Institution`, `Date_of_Birth`, `Detailed_ID`, `Various_Other_Info`, `Nature_of_Association`, `Regular_Contribution`) VALUES
(1, 101, 'rajesh.sharma@university.edu', '9876543210', 'ABCDE1234F', '123456789012', 'Ph.D. in Computer Science', 'AI, Machine Learning', '2010-06-15', 15, 'Worked at XYZ University', 5, 45, 'Industry projects in AI', NULL, 'Professor', NULL, '2015-08-20', 'Visiting Professor at ABC Institute', '1979-04-12', 'ID-RAJ101', 'Published 20 research papers', 'Permanent Faculty', 'Reviewer for top AI conferences'),
(2, 102, 'anjali.mehta@university.edu', '9876543211', 'FGHIJ5678K', '123456789013', 'Ph.D. in Mechanical Engineering', 'Thermal Dynamics, Robotics', '2008-09-10', 17, 'Worked at DEF Tech Institute', 3, 46, 'Industry consultant', NULL, 'Professor', NULL, '2013-05-12', NULL, '1978-08-22', 'ID-ANJ102', 'Patent holder in turbine design', 'Permanent Faculty', 'Technical Advisor at MechTech Pvt. Ltd.'),
(3, 103, 'suresh.reddy@university.edu', '9876543212', 'KLMNO9876P', '123456789014', 'Ph.D. in Electronics', 'Embedded Systems, VLSI', '2012-02-25', 12, 'Worked at GHI Research Labs', 4, 42, 'Consulting for semiconductor firms', NULL, 'Associate Professor', NULL, '2018-03-15', 'Visiting Faculty at JKL Institute', '1982-07-30', 'ID-SUR103', 'Developed a custom microcontroller', 'Permanent Faculty', 'Collaborator with major chip manufacturers'),
(4, 104, 'kavita.patel@university.edu', '9876543213', 'QRSTU5432V', '123456789015', 'Ph.D. in Electrical Engineering', 'Power Systems, Renewable Energy', '2011-11-20', 14, 'Worked at Energy Solutions Ltd.', 2, 43, 'Project management in smart grids', NULL, 'Professor', NULL, '2017-10-08', 'Adjunct Professor at PQR Institute', '1981-01-15', 'ID-KAV104', 'Designed a new solar panel efficiency model', 'Permanent Faculty', 'Mentor for government energy projects'),
(5, 105, 'amit.verma@university.edu', '9876543214', 'VWXYZ3210T', '123456789016', 'Ph.D. in Information Technology', 'Cybersecurity, Cloud Computing', '2009-07-05', 16, 'Worked at DataSecure Pvt. Ltd.', 6, 44, 'Developed a security protocol for cloud storage', NULL, 'Professor', NULL, '2014-12-10', 'Cybersecurity Consultant at DEF Corp.', '1980-09-25', 'ID-AMI105', 'Speaker at global security conferences', 'Permanent Faculty', 'Member of international cybersecurity forums');

-- --------------------------------------------------------

--
-- Table structure for table `faculty_professional_body`
--

CREATE TABLE `faculty_professional_body` (
  `SrNo` int NOT NULL AUTO_INCREMENT,
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

--
-- Dumping data for table `faculty_professional_body`
--

INSERT INTO `faculty_professional_body` (`SrNo`, `Professional_Body_ID`, `F_ID`, `Professional_Body_Name`, `Membership_Level`, `Joining_Date`, `Validity_Date`, `Initial_Grade`, `Membership_Grade`, `Membership_Number`, `Unique_ID`, `Contributions`, `Attachment_Document`, `Position`, `Official_Role`, `Attendee_Count`) VALUES
(7, 1, 101, 'IEEE', 'International', '2018-06-15', '2026-06-15', 'Member', 'Senior Member', 'IEEE-123456', 'UID-IEEE101', 'Published 3 IEEE papers, Organized an AI workshop', NULL, 'Committee Member', 'Editorial Board Member', 120),
(8, 2, 102, 'ACM', 'International', '2019-08-10', '2025-08-10', 'Member', 'Professional Member', 'ACM-789654', 'UID-ACM102', 'Contributed to Software Engineering research, Reviewer for ACM Journal', NULL, 'Technical Committee', 'Reviewer', 85),
(9, 3, 103, 'ISTE', 'National', '2017-05-20', '2027-05-20', 'Associate', 'Fellow', 'ISTE-564738', 'UID-ISTE103', 'Organized multiple faculty development programs', NULL, 'Executive Member', 'Program Coordinator', 200),
(10, 4, 104, 'CSI', 'National', '2020-01-12', '2025-01-12', 'Member', 'Senior Member', 'CSI-098321', 'UID-CSI104', 'Contributed to Cybersecurity conferences, Chaired panel discussions', NULL, 'Core Committee', 'Cybersecurity Panelist', 75),
(11, 5, 105, 'ASME', 'International', '2016-09-30', '2026-09-30', 'Member', 'Life Member', 'ASME-456123', 'UID-ASME105', 'Published research on Mechanical Dynamics, Conducted student workshops', NULL, 'Regional Coordinator', 'Student Mentor', 50),
(12, 6, 105, 'Institution of Engineers India', 'National', '2015-11-25', '2025-11-25', 'Member', 'Chartered Engineer', 'IEI-741852', 'UID-IEI106', 'Industry-academia collaboration for Engineering student', NULL, 'Advisory Board', 'Mentor & Guide', 95);

-- --------------------------------------------------------

--
-- Table structure for table `faculty_resource_person`
--

CREATE TABLE `faculty_resource_person` (
  `Resource_Person_ID` int NOT NULL AUTO_INCREMENT,
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

--
-- Dumping data for table `faculty_resource_person`
--

INSERT INTO `faculty_resource_person` (`Resource_Person_ID`, `F_ID`, `Program_Type`, `Program_Name`, `Event_Date`, `Event_Duration`, `Location`, `Event_Mode`, `Organized_By`, `Faculty_Role`, `Topics_Covered`, `Certificate_Issued`, `Certificate_Upload`, `Remarks`, `Event_Status`, `Faculty_Name`) VALUES
(1, 101, 'Workshop', 'AI & Machine Learning', '2024-02-15', '3 Days', 'IIT Bombay', 'Offline', 'IIT Bombay', 'Keynote Speaker', 'Deep Learning, Neural Networks, AI Ethics', 1, NULL, 'Highly appreciated by participants', 'Completed', 'Dr. Amit Sharma'),
(2, 102, 'Conference', 'Cloud Computing Trends', '2023-11-10', '2 Days', 'NIT Trichy', 'Offline', 'NIT Trichy', 'Session Chair', 'Cloud Security, Serverless Computing', 1, NULL, 'Session was interactive and informative', 'Completed', 'Dr. Richa Patel'),
(3, 103, 'Seminar', 'Future of Cybersecurity', '2024-03-22', '1 Day', 'Online', 'Online', 'IEEE India', 'Guest Lecturer', 'Cyber Threats, Blockchain Security', 1, NULL, 'Attended by 500+ student and researchers', 'Completed', 'Dr. Rajesh Kumar'),
(4, 104, 'Webinar', 'IoT and Smart Cities', '2023-09-18', '2 Hours', 'Online', 'Online', 'ACM Chapter', 'Speaker', 'IoT Applications, 5G, Smart City Challenges', 1, NULL, 'Engaging session with Q&A', 'Completed', 'Dr. Neha Verma'),
(5, 105, 'Faculty Development Program', 'Big Data & Analytics', '2023-07-05', '5 Days', 'IISc Bangalore', 'Offline', 'IISc Bangalore', 'Trainer', 'Hadoop, Spark, Data Pipelines', 1, NULL, 'Hands-on sessions were well received', 'Completed', 'Dr. Sandeep Rao'),
(6, 104, 'Guest Lecture', 'Renewable Energy Systems', '2024-01-12', '1 Day', 'IIT Delhi', 'Offline', 'IIT Delhi', 'Resource Person', 'Solar Power, Wind Energy, Green Technologies', 1, NULL, 'Very informative for student', 'Completed', 'Dr. Meena Joshi');

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
  ADD PRIMARY KEY (`id`),
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
  ADD PRIMARY KEY (`Contribution_ID`),
  ADD KEY `F_ID` (`F_ID`);

--
-- Indexes for table `faculty_details`
--
ALTER TABLE `faculty_details`
  ADD PRIMARY KEY (`Sr_No`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD UNIQUE KEY `Phone_Number` (`Phone_Number`),
  ADD UNIQUE KEY `PAN_Number` (`PAN_Number`),
  ADD UNIQUE KEY `Aadhaar_Number` (`Aadhaar_Number`),
  ADD KEY `F_ID` (`F_ID`);

--
-- Indexes for table `faculty_professional_body`
--
ALTER TABLE `faculty_professional_body`
  ADD PRIMARY KEY (`SrNo`),
  ADD UNIQUE KEY `Membership_Number` (`Membership_Number`),
  ADD UNIQUE KEY `Unique_ID` (`Unique_ID`),
  ADD KEY `F_ID` (`F_ID`);

--
-- Indexes for table `faculty_resource_person`
--
ALTER TABLE `faculty_resource_person`
  ADD PRIMARY KEY (`Resource_Person_ID`),
  ADD KEY `F_ID` (`F_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `Department_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `department_details`
--
ALTER TABLE `department_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `faculty_contributions`
--
ALTER TABLE `faculty_contributions`
  MODIFY `Contribution_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `faculty_details`
--
ALTER TABLE `faculty_details`
  MODIFY `Sr_No` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `faculty_professional_body`
--
ALTER TABLE `faculty_professional_body`
  MODIFY `SrNo` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `faculty_resource_person`
--
ALTER TABLE `faculty_resource_person`
  MODIFY `Resource_Person_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
-- Constraints for table `faculty_resource_person`
--
ALTER TABLE `faculty_resource_person`
  ADD CONSTRAINT `faculty_resource_person_ibfk_1` FOREIGN KEY (`F_ID`) REFERENCES `faculty` (`F_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */; 