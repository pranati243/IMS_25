// This is a mock implementation for faculty_awards, faculty_memberships, and faculty_contributions tables
// to ensure the biodata API works properly even if the tables don't exist yet

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    // Check if tables exist, if not create them
    await createTablesIfNotExist();

    return NextResponse.json({
      success: true,
      message:
        "Required database tables for biodata created or validated successfully",
    });
  } catch (error) {
    console.error("Error setting up biodata tables:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to set up biodata database tables",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

async function createTablesIfNotExist() {
  // Check and create faculty_awards table if it doesn't exist
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS faculty_awards (
        award_id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_id BIGINT NOT NULL,
        award_name VARCHAR(255) NOT NULL,
        awarding_organization VARCHAR(255) NOT NULL,
        award_date DATE NOT NULL,
        award_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (faculty_id),
        CONSTRAINT fk_faculty_awards_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(F_id)
      )
    `);

    console.log("faculty_awards table checked/created successfully");

    // Check if we have sample data in faculty_awards
    const awardsCheck = (await query(
      "SELECT COUNT(*) as count FROM faculty_awards"
    )) as RowDataPacket[];

    if (awardsCheck[0].count === 0) {
      // Insert sample data
      await query(`
        INSERT INTO faculty_awards (faculty_id, award_name, awarding_organization, award_date, award_description)
        SELECT 
          f.F_id, 
          CONCAT('Best Teacher Award ', YEAR(CURRENT_DATE()) - FLOOR(RAND() * 5)),
          CASE FLOOR(RAND() * 3)
            WHEN 0 THEN 'University Excellence Committee'
            WHEN 1 THEN 'Department of Higher Education'
            ELSE 'National Education Society'
          END,
          DATE_SUB(CURRENT_DATE(), INTERVAL FLOOR(RAND() * 1000) DAY),
          CASE FLOOR(RAND() * 3)
            WHEN 0 THEN 'For outstanding contribution to teaching methodology'
            WHEN 1 THEN 'For research excellence and mentoring student'
            ELSE 'For innovation in education and learning practices'
          END
        FROM faculty f
        LIMIT 10
      `);
      console.log("Sample data added to faculty_awards");
    }

    // Check and create faculty_memberships table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS faculty_memberships (
        membership_id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_id BIGINT NOT NULL,
        organization VARCHAR(255) NOT NULL,
        membership_type VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (faculty_id),
        CONSTRAINT fk_faculty_memberships_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(F_id)
      )
    `);

    console.log("faculty_memberships table checked/created successfully");

    // Check if we have sample data in faculty_memberships
    const membershipsCheck = (await query(
      "SELECT COUNT(*) as count FROM faculty_memberships"
    )) as RowDataPacket[];

    if (membershipsCheck[0].count === 0) {
      // Insert sample data
      await query(`
        INSERT INTO faculty_memberships (faculty_id, organization, membership_type, start_date, end_date, description)
        SELECT 
          f.F_id, 
          CASE FLOOR(RAND() * 5)
            WHEN 0 THEN 'IEEE'
            WHEN 1 THEN 'ACM'
            WHEN 2 THEN 'Computer Society of India'
            WHEN 3 THEN 'Institution of Engineers'
            ELSE 'ISTE'
          END,
          CASE FLOOR(RAND() * 3)
            WHEN 0 THEN 'Professional Member'
            WHEN 1 THEN 'Senior Member'
            ELSE 'Fellow'
          END,
          DATE_SUB(CURRENT_DATE(), INTERVAL FLOOR(RAND() * 2000) DAY),
          CASE WHEN RAND() > 0.7 THEN NULL ELSE DATE_ADD(CURRENT_DATE(), INTERVAL FLOOR(RAND() * 500) DAY) END,
          'Active member participating in various technical activities'
        FROM faculty f
        LIMIT 10
      `);
      console.log("Sample data added to faculty_memberships");
    }

    // Check and create faculty_contributions table if it doesn't exist already
    await query(`
      CREATE TABLE IF NOT EXISTS faculty_contributions (
        contribution_id INT AUTO_INCREMENT PRIMARY KEY,
        F_ID BIGINT NOT NULL,
        contribution_type VARCHAR(50) NOT NULL,
        contribution_title VARCHAR(255) NOT NULL,
        contribution_date DATE NOT NULL,
        year INT,
        journal_conference VARCHAR(255),
        award VARCHAR(255),
        impact_factor VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (F_ID),
        CONSTRAINT fk_faculty_contributions_faculty FOREIGN KEY (F_ID) REFERENCES faculty(F_id)
      )
    `);

    console.log("faculty_contributions table checked/created successfully");

    // Check if we have sample data in faculty_contributions
    const contributionsCheck = (await query(
      "SELECT COUNT(*) as count FROM faculty_contributions"
    )) as RowDataPacket[];

    if (contributionsCheck[0].count === 0) {
      // Insert sample data
      await query(`
        INSERT INTO faculty_contributions (F_ID, contribution_type, contribution_title, contribution_date, year, journal_conference, award, impact_factor, description)
        SELECT 
          f.F_id, 
          CASE FLOOR(RAND() * 5)
            WHEN 0 THEN 'journal'
            WHEN 1 THEN 'conference'
            WHEN 2 THEN 'workshop'
            WHEN 3 THEN 'project'
            ELSE 'book'
          END,
          CONCAT('Research on ', CASE FLOOR(RAND() * 5)
            WHEN 0 THEN 'Machine Learning Algorithms'
            WHEN 1 THEN 'Artificial Intelligence Applications'
            WHEN 2 THEN 'IoT Security Frameworks'
            WHEN 3 THEN 'Cloud Computing Optimization'
            ELSE 'Data Analytics in Higher Education'
          END),
          DATE_SUB(CURRENT_DATE(), INTERVAL FLOOR(RAND() * 1000) DAY),
          YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL FLOOR(RAND() * 1000) DAY)),
          CASE FLOOR(RAND() * 3)
            WHEN 0 THEN 'IEEE Transactions'
            WHEN 1 THEN 'International Conference on Computer Science'
            ELSE 'Journal of Advanced Research'
          END,
          CASE WHEN RAND() > 0.8 THEN 'Best Paper Award' ELSE NULL END,
          CASE WHEN RAND() > 0.7 THEN CONCAT(ROUND(RAND() * 10, 2)) ELSE NULL END,
          'Significant contribution to the field of computer science and engineering'
        FROM faculty f
        ORDER BY RAND()
        LIMIT 30
      `);
      console.log("Sample data added to faculty_contributions");
    }

    return true;
  } catch (error) {
    console.error("Error in createTablesIfNotExist:", error);
    throw error;
  }
}
