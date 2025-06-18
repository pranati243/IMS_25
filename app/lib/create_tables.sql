-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `ims2025`;
USE `ims2025`;

-- Table structure for table `department`
CREATE TABLE `department` (
  `Department_ID` int NOT NULL AUTO_INCREMENT,
  `Department_Name` varchar(255) NOT NULL,
  PRIMARY KEY (`Department_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `faculty`
CREATE TABLE `faculty` (
  `F_id` bigint NOT NULL AUTO_INCREMENT,
  `F_name` varchar(255) NOT NULL,
  `F_dept` text NOT NULL,
  PRIMARY KEY (`F_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `department_details`
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
  `Research_Focus_Area` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Department_Code` (`Department_Code`),
  UNIQUE KEY `Email_ID` (`Email_ID`),
  UNIQUE KEY `Department_Phone_Number` (`Department_Phone_Number`),
  KEY `Department_ID` (`Department_ID`),
  KEY `HOD_ID` (`HOD_ID`),
  CONSTRAINT `department_details_ibfk_1` FOREIGN KEY (`Department_ID`) REFERENCES `department` (`Department_ID`) ON DELETE CASCADE,
  CONSTRAINT `department_details_ibfk_2` FOREIGN KEY (`HOD_ID`) REFERENCES `faculty` (`F_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `faculty_contributions`
CREATE TABLE `faculty_contributions` (
  `Contribution_ID` int NOT NULL AUTO_INCREMENT,
  `F_ID` bigint NOT NULL,
  `Contribution_Type` varchar(255) NOT NULL,
  `Description` text NOT NULL,
  `Contribution_Date` date NOT NULL,
  `Recognized_By` varchar(255) DEFAULT NULL,
  `Award_Received` varchar(255) DEFAULT NULL,
  `Documents_Attached` blob,
  `Remarks` text,
  PRIMARY KEY (`Contribution_ID`),
  KEY `F_ID` (`F_ID`),
  CONSTRAINT `faculty_contributions_ibfk_1` FOREIGN KEY (`F_ID`) REFERENCES `faculty` (`F_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `faculty_details`
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
  `Regular_Contribution` text,
  PRIMARY KEY (`Sr_No`),
  UNIQUE KEY `Email` (`Email`),
  UNIQUE KEY `Phone_Number` (`Phone_Number`),
  UNIQUE KEY `PAN_Number` (`PAN_Number`),
  UNIQUE KEY `Aadhaar_Number` (`Aadhaar_Number`),
  KEY `F_ID` (`F_ID`),
  CONSTRAINT `faculty_details_ibfk_1` FOREIGN KEY (`F_ID`) REFERENCES `faculty` (`F_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `faculty_professional_body`
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
  `Attendee_Count` smallint DEFAULT NULL,
  PRIMARY KEY (`SrNo`),
  UNIQUE KEY `Membership_Number` (`Membership_Number`),
  UNIQUE KEY `Unique_ID` (`Unique_ID`),
  KEY `F_ID` (`F_ID`),
  CONSTRAINT `faculty_professional_body_ibfk_1` FOREIGN KEY (`F_ID`) REFERENCES `faculty` (`F_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `faculty_resource_person`
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
  `Faculty_Name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Resource_Person_ID`),
  KEY `F_ID` (`F_ID`),
  CONSTRAINT `faculty_resource_person_ibfk_1` FOREIGN KEY (`F_ID`) REFERENCES `faculty` (`F_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; 