import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

// This is a debug endpoint to test faculty form submission
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, message: "Debug routes are disabled in production" },
      { status: 403 }
    );
  }
  
  try {
    // Check tables and schemas
    const facultyTableCheck = await query("SHOW TABLES LIKE 'faculty'");
    const facultyDetailsCheck = await query("SHOW TABLES LIKE 'faculty_details'");
    
    const facultyTableExists = (facultyTableCheck as any[]).length > 0;
    const facultyDetailsExists = (facultyDetailsCheck as any[]).length > 0;
    
    // Describe tables if they exist
    let facultySchema = null;
    let facultyDetailsSchema = null;
    
    if (facultyTableExists) {
      facultySchema = await query("DESCRIBE faculty");
    }
    
    if (facultyDetailsExists) {
      facultyDetailsSchema = await query("DESCRIBE faculty_details");
    }
    
    // Try to fetch a sample faculty record for testing
    let sampleFaculty = null;
    if (facultyTableExists) {
      const facultyRecords = await query("SELECT * FROM faculty LIMIT 1");
      if ((facultyRecords as any[]).length > 0) {
        sampleFaculty = (facultyRecords as any[])[0];
      }
    }
    
    // Return diagnostic information
    return NextResponse.json({
      success: true,
      facultyTableExists,
      facultyDetailsExists,
      facultySchema,
      facultyDetailsSchema,
      sampleFaculty,
      message: "Faculty form submission diagnostic information"
    });
  } catch (error) {
    console.error("Error in faculty edit test:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error testing faculty form submission",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// This endpoint can be used to test the PUT method for faculty updates
export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, message: "Debug routes are disabled in production" },
      { status: 403 }
    );
  }
  
  try {
    const body = await request.json();
    const { facultyId } = body;
    
    if (!facultyId) {
      return NextResponse.json(
        { success: false, message: "Faculty ID is required" },
        { status: 400 }
      );
    }
    
    // Sample update data
    const sampleUpdateData = {
      F_name: "Test Faculty Update",
      F_dept: "Computer Engineering",
      Email: "test.update@example.com",
      Phone_Number: "9876543210",
      PAN_Number: "ABCDE1234F",
      Aadhaar_Number: "123456789012",
      Highest_Degree: "PhD",
      Area_of_Certification: "Artificial Intelligence",
      Date_of_Joining: new Date().toISOString().split('T')[0],
      Experience: 5,
      Past_Experience: "Industry experience",
      Age: 35,
      Current_Designation: "Assistant Professor",
      Date_of_Birth: "1985-01-01",
      Nature_of_Association: "Permanent"
    };
    
    console.log(`Test updating faculty with ID ${facultyId}`);
    
    // First update faculty table
    try {
      await query(
        `UPDATE faculty SET F_name = ?, F_dept = ? WHERE F_id = ?`,
        [sampleUpdateData.F_name, sampleUpdateData.F_dept, facultyId]
      );
      console.log("Basic faculty data updated");
    } catch (error) {
      console.error("Error updating faculty table:", error);
      throw new Error(`Faculty table update failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Check if faculty_details exists and create if needed
    try {
      const detailsTableExists = await query("SHOW TABLES LIKE 'faculty_details'");
      
      if ((detailsTableExists as any[]).length === 0) {
        console.log("Creating faculty_details table");
        await query(`
          CREATE TABLE faculty_details (
            F_ID INT NOT NULL,
            Email VARCHAR(100),
            Phone_Number VARCHAR(20),
            PAN_Number VARCHAR(20),
            Aadhaar_Number VARCHAR(20),
            Highest_Degree VARCHAR(100),
            Area_of_Certification VARCHAR(100),
            Date_of_Joining DATE,
            Experience INT,
            Past_Experience VARCHAR(200),
            Age INT,
            Current_Designation VARCHAR(100),
            Date_of_Birth DATE,
            Nature_of_Association VARCHAR(100),
            PRIMARY KEY (F_ID),
            FOREIGN KEY (F_ID) REFERENCES faculty(F_id) ON DELETE CASCADE
          )
        `);
      }
    } catch (error) {
      console.error("Error with faculty_details table:", error);
    }
    
    // Now update or insert faculty details
    try {
      const detailsExist = await query(
        `SELECT 1 FROM faculty_details WHERE F_ID = ? LIMIT 1`,
        [facultyId]
      );
      
      if ((detailsExist as any[]).length === 0) {
        // Insert
        console.log("Inserting new faculty details");
        await query(
          `INSERT INTO faculty_details (
            F_ID, Email, Phone_Number, PAN_Number, Aadhaar_Number,
            Highest_Degree, Area_of_Certification, Date_of_Joining,
            Experience, Past_Experience, Age, Current_Designation,
            Date_of_Birth, Nature_of_Association
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            facultyId,
            sampleUpdateData.Email,
            sampleUpdateData.Phone_Number,
            sampleUpdateData.PAN_Number,
            sampleUpdateData.Aadhaar_Number,
            sampleUpdateData.Highest_Degree,
            sampleUpdateData.Area_of_Certification,
            sampleUpdateData.Date_of_Joining,
            sampleUpdateData.Experience,
            sampleUpdateData.Past_Experience,
            sampleUpdateData.Age,
            sampleUpdateData.Current_Designation,
            sampleUpdateData.Date_of_Birth,
            sampleUpdateData.Nature_of_Association,
          ]
        );
      } else {
        // Update
        console.log("Updating existing faculty details");
        await query(
          `UPDATE faculty_details 
           SET Email = ?, Phone_Number = ?, PAN_Number = ?, Aadhaar_Number = ?,
               Highest_Degree = ?, Area_of_Certification = ?, Date_of_Joining = ?,
               Experience = ?, Past_Experience = ?, Age = ?, Current_Designation = ?,
               Date_of_Birth = ?, Nature_of_Association = ?
           WHERE F_ID = ?`,
          [
            sampleUpdateData.Email,
            sampleUpdateData.Phone_Number,
            sampleUpdateData.PAN_Number,
            sampleUpdateData.Aadhaar_Number,
            sampleUpdateData.Highest_Degree,
            sampleUpdateData.Area_of_Certification,
            sampleUpdateData.Date_of_Joining,
            sampleUpdateData.Experience,
            sampleUpdateData.Past_Experience,
            sampleUpdateData.Age,
            sampleUpdateData.Current_Designation,
            sampleUpdateData.Date_of_Birth,
            sampleUpdateData.Nature_of_Association,
            facultyId,
          ]
        );
      }
    } catch (error) {
      console.error("Error with faculty details update/insert:", error);
      throw new Error(`Faculty details update failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return NextResponse.json({
      success: true,
      message: "Faculty test update completed successfully",
      updatedWith: sampleUpdateData
    });
  } catch (error) {
    console.error("Error in faculty update test:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error in faculty update test",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 