import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, message: "Debug routes are disabled in production" },
      { status: 403 }
    );
  }
  
  const results: Record<string, any> = {};
  
  try {
    // Check if faculty_contributions table exists, if not, create it with proper column names
    try {
      const contributionsTableExists = await query("SHOW TABLES LIKE 'faculty_contributions'");
      
      if ((contributionsTableExists as any[]).length === 0) {
        // Create the table with proper column names
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
        // Check if Contribution_ID column exists
        const columns = await query("SHOW COLUMNS FROM faculty_contributions");
        const columnExists = (columns as any[]).some(col => col.Field === 'Contribution_ID');
        
        if (!columnExists) {
          try {
            // Add the Contribution_ID column if it doesn't exist
            await query("ALTER TABLE faculty_contributions ADD COLUMN Contribution_ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST");
            results.contribution_id_column = "Added successfully";
          } catch (alterError) {
            // If error is about primary key already existing, try a different approach
            if (alterError instanceof Error && alterError.message.includes('multiple primary key')) {
              // Find out which column is the primary key
              const primaryKeyInfo = await query("SHOW KEYS FROM faculty_contributions WHERE Key_name = 'PRIMARY'");
              const primaryKeyColumn = (primaryKeyInfo as any[])[0]?.Column_name;
              
              if (primaryKeyColumn) {
                // Rename the existing primary key column to Contribution_ID
                await query(`ALTER TABLE faculty_contributions CHANGE ${primaryKeyColumn} Contribution_ID INT NOT NULL AUTO_INCREMENT`);
                results.contribution_id_column = "Renamed from " + primaryKeyColumn;
              } else {
                results.contribution_id_error = "Unable to determine primary key for renaming";
              }
            } else {
              results.contribution_id_error = alterError instanceof Error ? alterError.message : String(alterError);
            }
          }
        } else {
          results.contribution_id_column = "Already exists";
        }
      }
    } catch (error) {
      results.faculty_contributions_error = error instanceof Error ? error.message : String(error);
    }
    
    // Check if faculty_professional_body table exists and has SrNo column
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
        // Check if SrNo column exists
        const columns = await query("SHOW COLUMNS FROM faculty_professional_body");
        const columnExists = (columns as any[]).some(col => col.Field === 'SrNo');
        
        if (!columnExists) {
          try {
            // Add the SrNo column if it doesn't exist
            await query("ALTER TABLE faculty_professional_body ADD COLUMN SrNo INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST");
            results.srno_column = "Added successfully";
          } catch (alterError) {
            // If error is about primary key already existing, try a different approach
            if (alterError instanceof Error && alterError.message.includes('multiple primary key')) {
              // Find out which column is the primary key
              const primaryKeyInfo = await query("SHOW KEYS FROM faculty_professional_body WHERE Key_name = 'PRIMARY'");
              const primaryKeyColumn = (primaryKeyInfo as any[])[0]?.Column_name;
              
              if (primaryKeyColumn) {
                // Rename the existing primary key column to SrNo
                await query(`ALTER TABLE faculty_professional_body CHANGE ${primaryKeyColumn} SrNo INT NOT NULL AUTO_INCREMENT`);
                results.srno_column = "Renamed from " + primaryKeyColumn;
              } else {
                results.srno_error = "Unable to determine primary key for renaming";
              }
            } else {
              results.srno_error = alterError instanceof Error ? alterError.message : String(alterError);
            }
          }
        } else {
          results.srno_column = "Already exists";
        }
      }
    } catch (error) {
      results.faculty_professional_body_error = error instanceof Error ? error.message : String(error);
    }
    
    return NextResponse.json({
      success: true,
      message: "Faculty table columns fixed or created",
      results
    });
  } catch (error) {
    console.error("Error fixing faculty columns:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fixing faculty table columns",
        error: error instanceof Error ? error.message : String(error),
        results
      },
      { status: 500 }
    );
  }
} 