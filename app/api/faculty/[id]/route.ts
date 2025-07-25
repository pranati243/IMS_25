import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`Fetching faculty data for ID: ${id}`);

    // First check if the faculty exists
    const facultyExists = await query(`SELECT * FROM faculty WHERE F_id = ?`, [
      id,
    ]);

    if (!facultyExists || !(facultyExists as any[]).length) {
      console.log(`Faculty with ID ${id} not found`);
      return NextResponse.json(
        {
          success: false,
          message: "Faculty not found",
        },
        { status: 404 }
      );
    }

    const basicFaculty = (facultyExists as any[])[0];

    // Then check if faculty_details table exists
    try {
      const detailsTableExists = await query(
        "SHOW TABLES LIKE 'faculty_details'"
      );

      if ((detailsTableExists as any[]).length === 0) {
        console.log(
          "faculty_details table does not exist, returning basic faculty data"
        );
        // Return just the basic faculty data if details table doesn't exist
        return NextResponse.json({
          ...basicFaculty,
          // Add empty values for expected fields to prevent form errors
          Email: "",
          Phone_Number: "",
          PAN_Number: "",
          Aadhaar_Number: "",
          Highest_Degree: "",
          Area_of_Certification: "",
          Date_of_Joining: null,
          Experience: 0,
          Past_Experience: "",
          Age: 18,
          Current_Designation: "",
          Date_of_Birth: null,
          Nature_of_Association: "",
        });
      }
    } catch (error) {
      console.error("Error checking faculty_details table:", error);
    }

    // Try to get the faculty with details
    const faculty = await query(
      `
      SELECT 
        f.*,
        fd.*
      FROM faculty f
      LEFT JOIN faculty_details fd ON f.F_id = fd.F_ID
      WHERE f.F_id = ?
      `,
      [id]
    );

    // If we have data with details, return it
    if (faculty && (faculty as any[]).length > 0) {
      const facultyData = (faculty as any[])[0];

      // Convert date strings to proper format for the form
      if (facultyData.Date_of_Joining) {
        facultyData.Date_of_Joining =
          facultyData.Date_of_Joining instanceof Date
            ? facultyData.Date_of_Joining
            : new Date(facultyData.Date_of_Joining);
      }

      if (facultyData.Date_of_Birth) {
        facultyData.Date_of_Birth =
          facultyData.Date_of_Birth instanceof Date
            ? facultyData.Date_of_Birth
            : new Date(facultyData.Date_of_Birth);
      }

      return NextResponse.json(facultyData);
    }

    // If we don't have details but faculty exists, return faculty with empty details
    console.log(`Faculty found but no details for ID ${id}`);
    return NextResponse.json({
      ...basicFaculty,
      // Add empty values for expected fields to prevent form errors
      Email: "",
      Phone_Number: "",
      PAN_Number: "",
      Aadhaar_Number: "",
      Highest_Degree: "",
      Area_of_Certification: "",
      Date_of_Joining: null,
      Experience: 0,
      Past_Experience: "",
      Age: 18,
      Current_Designation: "",
      Date_of_Birth: null,
      Nature_of_Association: "",
    });
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching faculty data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`Updating faculty data for ID: ${id}`);
    const body = await request.json();
    const {
      F_name,
      F_dept,
      Email,
      Phone_Number,
      PAN_Number,
      Aadhaar_Number,
      Highest_Degree,
      Area_of_Certification,
      Date_of_Joining,
      Experience,
      Past_Experience,
      Age,
      Current_Designation,
      Date_of_Birth,
      Nature_of_Association,
    } = body;

    console.log("Received data for update:", body);

    // Update faculty table
    try {
      await query(
        `
        UPDATE faculty 
        SET F_name = ?, F_dept = ?
        WHERE F_id = ?
      `,
        [F_name, F_dept, id]
      );
      console.log(`Successfully updated basic faculty info for ID ${id}`);
    } catch (error) {
      console.error("Error updating faculty table:", error);
      throw new Error(
        `Failed to update faculty: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Check if faculty_details table exists
    try {
      const detailsTableExists = await query(
        "SHOW TABLES LIKE 'faculty_details'"
      );

      if ((detailsTableExists as any[]).length === 0) {
        console.log("faculty_details table doesn't exist, creating it");
        // Create the table
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
        console.log("faculty_details table created successfully");
      }
    } catch (error) {
      console.error("Error checking/creating faculty_details table:", error);
      // Don't throw here, try to continue
    }

    // Check if record exists in faculty_details for this faculty
    try {
      const details = await query(
        `SELECT 1 FROM faculty_details WHERE F_ID = ? LIMIT 1`,
        [id]
      );

      if ((details as any[]).length === 0) {
        // Insert new record
        console.log(`Creating new faculty_details record for faculty ID ${id}`);
        await query(
          `
          INSERT INTO faculty_details (
            F_ID,
            Email,
            Phone_Number,
            PAN_Number,
            Aadhaar_Number,
            Highest_Degree,
            Area_of_Certification,
            Date_of_Joining,
            Experience,
            Past_Experience,
            Age,
            Current_Designation,
            Date_of_Birth,
            Nature_of_Association
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            id,
            Email,
            Phone_Number,
            PAN_Number,
            Aadhaar_Number,
            Highest_Degree,
            Area_of_Certification,
            Date_of_Joining,
            Experience,
            Past_Experience,
            Age,
            Current_Designation,
            Date_of_Birth,
            Nature_of_Association,
          ]
        );
        console.log(`Faculty details record created successfully for ID ${id}`);
      } else {
        // Update existing record
        console.log(`Updating faculty_details for faculty ID ${id}`);
        await query(
          `
          UPDATE faculty_details 
          SET 
            Email = ?,
            Phone_Number = ?,
            PAN_Number = ?,
            Aadhaar_Number = ?,
            Highest_Degree = ?,
            Area_of_Certification = ?,
            Date_of_Joining = ?,
            Experience = ?,
            Past_Experience = ?,
            Age = ?,
            Current_Designation = ?,
            Date_of_Birth = ?,
            Nature_of_Association = ?
          WHERE F_ID = ?
          `,
          [
            Email,
            Phone_Number,
            PAN_Number,
            Aadhaar_Number,
            Highest_Degree,
            Area_of_Certification,
            Date_of_Joining,
            Experience,
            Past_Experience,
            Age,
            Current_Designation,
            Date_of_Birth,
            Nature_of_Association,
            id,
          ]
        );
        console.log(`Faculty details updated successfully for ID ${id}`);
      }
    } catch (error) {
      console.error("Error updating faculty details:", error);
      throw new Error(
        `Failed to update faculty details: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Faculty updated successfully",
    });
  } catch (error) {
    console.error("Error updating faculty:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating faculty",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get user info from auth system
    const authResponse = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!authResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();

    if (!authData.success || !authData.user) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Only admin, hod, or department users can delete faculty
    if (!["admin", "hod", "department"].includes(authData.user.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete faculty" },
        { status: 403 }
      );
    }

    const facultyId = params.id;
    if (!facultyId) {
      return NextResponse.json(
        { success: false, message: "Faculty ID is required" },
        { status: 400 }
      );
    }

    // Delete from faculty_details first (if exists)
    await query("DELETE FROM faculty_details WHERE F_ID = ?", [facultyId]);
    // Delete from faculty table
    await query("DELETE FROM faculty WHERE F_id = ?", [facultyId]);

    return NextResponse.json({ success: true, message: "Faculty deleted successfully" });
  } catch (error) {
    console.error("Error deleting faculty:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete faculty" },
      { status: 500 }
    );
  }
}
