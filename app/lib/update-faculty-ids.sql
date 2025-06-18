-- Update faculty IDs to follow department-specific numbering pattern
USE `ims2025`;

-- Create a temporary table to store the mapping of old to new IDs
CREATE TEMPORARY TABLE temp_faculty_mapping (
    old_id BIGINT,
    new_id BIGINT,
    department_name VARCHAR(255)
);

-- Insert mappings for Computer Engineering faculty (101, 102, etc.)
INSERT INTO temp_faculty_mapping
SELECT f.F_id, 
       (100 + ROW_NUMBER() OVER (ORDER BY f.F_id)) AS new_id,
       f.F_dept
FROM faculty f
WHERE f.F_dept = 'Computer Engineering'
ORDER BY f.F_id;

-- Insert mappings for Mechanical Engineering faculty (201, 202, etc.)
INSERT INTO temp_faculty_mapping
SELECT f.F_id, 
       (200 + ROW_NUMBER() OVER (ORDER BY f.F_id)) AS new_id,
       f.F_dept
FROM faculty f
WHERE f.F_dept = 'Mechanical Engineering'
ORDER BY f.F_id;

-- Insert mappings for Electronics and Telecommunication Engineering faculty (301, 302, etc.)
INSERT INTO temp_faculty_mapping
SELECT f.F_id, 
       (300 + ROW_NUMBER() OVER (ORDER BY f.F_id)) AS new_id,
       f.F_dept
FROM faculty f
WHERE f.F_dept = 'Electronics and Telecommunication Engineering'
ORDER BY f.F_id;

-- Insert mappings for Electrical Engineering faculty (401, 402, etc.)
INSERT INTO temp_faculty_mapping
SELECT f.F_id, 
       (400 + ROW_NUMBER() OVER (ORDER BY f.F_id)) AS new_id,
       f.F_dept
FROM faculty f
WHERE f.F_dept = 'Electrical Engineering'
ORDER BY f.F_id;

-- Insert mappings for Information Technology faculty (501, 502, etc.)
INSERT INTO temp_faculty_mapping
SELECT f.F_id, 
       (500 + ROW_NUMBER() OVER (ORDER BY f.F_id)) AS new_id,
       f.F_dept
FROM faculty f
WHERE f.F_dept = 'Information Technology'
ORDER BY f.F_id;

-- Show the old and new IDs for verification
SELECT * FROM temp_faculty_mapping ORDER BY new_id;

-- The following queries are commented out for safety - review and uncomment when ready to execute
-- Update each table that has a foreign key reference to the faculty table

-- Update department_details table
-- UPDATE department_details dd
-- JOIN temp_faculty_mapping tfm ON dd.HOD_ID = tfm.old_id
-- SET dd.HOD_ID = tfm.new_id;

-- Update faculty_contributions table
-- UPDATE faculty_contributions fc
-- JOIN temp_faculty_mapping tfm ON fc.F_ID = tfm.old_id
-- SET fc.F_ID = tfm.new_id;

-- Update faculty_details table
-- UPDATE faculty_details fd
-- JOIN temp_faculty_mapping tfm ON fd.F_ID = tfm.old_id
-- SET fd.F_ID = tfm.new_id;

-- Update faculty_professional_body table
-- UPDATE faculty_professional_body fpb
-- JOIN temp_faculty_mapping tfm ON fpb.F_ID = tfm.old_id
-- SET fpb.F_ID = tfm.new_id;

-- Update faculty_resource_person table
-- UPDATE faculty_resource_person frp
-- JOIN temp_faculty_mapping tfm ON frp.F_ID = tfm.old_id
-- SET frp.F_ID = tfm.new_id;

-- Update users table
-- UPDATE users u
-- JOIN temp_faculty_mapping tfm ON u.faculty_id = tfm.old_id
-- SET u.faculty_id = tfm.new_id, u.username = CAST(tfm.new_id AS CHAR);

-- Finally, update the primary key in the faculty table (requires special handling)
-- This approach requires temporary disabling of foreign key checks and should be done carefully
-- In a transaction to maintain data integrity

-- SET FOREIGN_KEY_CHECKS = 0;
-- 
-- START TRANSACTION;
-- 
-- -- Create a backup of faculty table
-- CREATE TABLE faculty_backup AS SELECT * FROM faculty;
-- 
-- -- Create temporary table with new IDs
-- CREATE TABLE faculty_temp AS 
-- SELECT tfm.new_id AS F_id, f.F_name, f.F_dept
-- FROM faculty f
-- JOIN temp_faculty_mapping tfm ON f.F_id = tfm.old_id;
-- 
-- -- Drop the original table
-- DROP TABLE faculty;
-- 
-- -- Recreate faculty table with same structure
-- CREATE TABLE faculty (
--   `F_id` bigint NOT NULL AUTO_INCREMENT,
--   `F_name` varchar(255) NOT NULL,
--   `F_dept` text NOT NULL,
--   PRIMARY KEY (`F_id`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
-- 
-- -- Insert data with new IDs
-- INSERT INTO faculty (F_id, F_name, F_dept)
-- SELECT * FROM faculty_temp;
-- 
-- -- Drop temporary table
-- DROP TABLE faculty_temp;
-- 
-- -- Verify data integrity
-- SELECT * FROM faculty ORDER BY F_id;
-- SELECT COUNT(*) FROM faculty_backup;
-- SELECT COUNT(*) FROM faculty;
-- 
-- -- If everything looks good, commit the transaction
-- COMMIT;
-- 
-- SET FOREIGN_KEY_CHECKS = 1;

-- Drop the temporary mapping table
DROP TEMPORARY TABLE temp_faculty_mapping; 