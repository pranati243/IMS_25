import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET() {
  //if (process.env.NODE_ENV === 'production') {
    //return NextResponse.json(
      //{ success: false, message: "Debug routes are disabled in production" },
      //{ status: 403 }
    //);
  //}
  
  const results: Record<string, any> = {};
  
  try {
    // Step 1: Check if faculty table exists, create it if it doesn't
    try {
      const facultyTableExists = await query("SHOW TABLES LIKE 'faculty'");
      
      if ((facultyTableExists as any[]).length === 0) {
        // Create the table
        await query(`
          CREATE TABLE faculty (
            F_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            F_name VARCHAR(100) NOT NULL,
            F_dept VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        results.faculty_table = "Created successfully";
      } else {
        // Make sure F_id is AUTO_INCREMENT
        try {
          await query("ALTER TABLE faculty MODIFY F_id INT NOT NULL AUTO_INCREMENT");
          results.faculty_table = "Updated AUTO_INCREMENT";
        } catch (alterError) {
          results.faculty_table = "Already exists";
        }
      }
    } catch (error) {
      results.faculty_table_error = error instanceof Error ? error.message : String(error);
    }
    
    // Step 2: Check if faculty_details table exists, create it if it doesn't
    try {
      const detailsTableExists = await query("SHOW TABLES LIKE 'faculty_details'");
      
      if ((detailsTableExists as any[]).length === 0) {
        // Create the table
        await query(`
          CREATE TABLE faculty_details (
            F_ID INT NOT NULL,
            Email VARCHAR(100),
            Phone_Number VARCHAR(20),
            Current_Designation VARCHAR(100),
            Highest_Degree VARCHAR(100),
            Experience INT,
            PRIMARY KEY (F_ID),
            FOREIGN KEY (F_ID) REFERENCES faculty(F_id) ON DELETE CASCADE
          )
        `);
        results.faculty_details_table = "Created successfully";
      } else {
        results.faculty_details_table = "Already exists";
      }
    } catch (error) {
      results.faculty_details_table_error = error instanceof Error ? error.message : String(error);
    }
    
    // Step 3: Check if faculty_contributions table exists, create it if it doesn't
    try {
      const contributionsTableExists = await query("SHOW TABLES LIKE 'faculty_contributions'");
      
      if ((contributionsTableExists as any[]).length === 0) {
        // Create the table
        await query(`
          CREATE TABLE faculty_contributions (
            Contribution_ID INT NOT NULL AUTO_INCREMENT,
            F_ID INT NOT NULL,
            Contribution_Type VARCHAR(100),
            Contribution_Title VARCHAR(255),
            Contribution_Date DATE,
            PRIMARY KEY (Contribution_ID),
            FOREIGN KEY (F_ID) REFERENCES faculty(F_id) ON DELETE CASCADE
          )
        `);
        results.faculty_contributions_table = "Created successfully";
      } else {
        results.faculty_contributions_table = "Already exists";
      }
    } catch (error) {
      results.faculty_contributions_table_error = error instanceof Error ? error.message : String(error);
    }
    
    // Step 4: Check if faculty_professional_body table exists, create it if it doesn't
    try {
      const profBodyTableExists = await query("SHOW TABLES LIKE 'faculty_professional_body'");
      
      if ((profBodyTableExists as any[]).length === 0) {
        // Create the table
        await query(`
          CREATE TABLE faculty_professional_body (
            SrNo INT NOT NULL AUTO_INCREMENT,
            F_ID INT NOT NULL,
            Body_Name VARCHAR(100),
            Membership_Type VARCHAR(100),
            Membership_Date DATE,
            PRIMARY KEY (SrNo),
            FOREIGN KEY (F_ID) REFERENCES faculty(F_id) ON DELETE CASCADE
          )
        `);
        results.faculty_professional_body_table = "Created successfully";
      } else {
        results.faculty_professional_body_table = "Already exists";
      }
    } catch (error) {
      results.faculty_professional_body_table_error = error instanceof Error ? error.message : String(error);
    }
    
    // Step 5: Add sample data if tables are empty
    try {
      const facultyCount = await query("SELECT COUNT(*) as count FROM faculty");
      
      if ((facultyCount as any[])[0].count === 0) {
        // Insert sample departments first if needed
        try {
          const deptCount = await query("SELECT COUNT(*) as count FROM department");
          
          if ((deptCount as any[])[0].count === 0) {
            await query(`
              INSERT INTO department (Department_Name) VALUES 
              ('Computer Science'),
              ('Electrical Engineering'),
              ('Mechanical Engineering'),
              ('Civil Engineering')
            `);
            results.department_sample_data = "Added";
          }
        } catch (deptError) {
          results.department_error = error instanceof Error ? error.message : String(error);
        }
        
        // Add sample faculty
        await query(`
          INSERT INTO faculty (F_name, F_dept) VALUES 
          ('Dr. John Smith', 'Computer Science'),
          ('Dr. Jane Doe', 'Computer Science'),
          ('Prof. Robert Johnson', 'Electrical Engineering'),
          ('Dr. Emily Brown', 'Mechanical Engineering')
        `);
        
        // Add sample faculty details
        try {
          await query(`
            INSERT INTO faculty_details (F_ID, Email, Phone_Number, Current_Designation, Highest_Degree, Experience) VALUES 
            (1, 'john.smith@example.com', '123-456-7890', 'Professor', 'Ph.D.', 15),
            (2, 'jane.doe@example.com', '123-456-7891', 'Associate Professor', 'Ph.D.', 10),
            (3, 'robert.johnson@example.com', '123-456-7892', 'Professor', 'Ph.D.', 20),
            (4, 'emily.brown@example.com', '123-456-7893', 'Assistant Professor', 'Ph.D.', 5)
          `);
        } catch (detailsError) {
          results.faculty_details_error = error instanceof Error ? error.message : String(error);
        }
        
        results.faculty_sample_data = "Added";
      } else {
        results.faculty_sample_data = "Already exists";
      }
    } catch (error) {
      results.sample_data_error = error instanceof Error ? error.message : String(error);
    }
    
    return NextResponse.json({
      success: true,
      message: "Faculty tables initialized or fixed",
      results
    });
  } catch (error) {
    console.error("Error initializing faculty tables:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error initializing faculty tables",
        error: error instanceof Error ? error.message : String(error),
        results
      },
      { status: 500 }
    );
  }
} 