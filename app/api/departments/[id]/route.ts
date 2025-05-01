import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`Fetching department data for ID: ${id}`);

    // First check if the department exists
    const departmentExists = await query(
      `SELECT * FROM department WHERE Department_ID = ?`,
      [id]
    );

    if (!departmentExists || !(departmentExists as any[]).length) {
      console.log(`Department with ID ${id} not found`);
      return NextResponse.json(
        {
          success: false,
          message: "Department not found",
        },
        { status: 404 }
      );
    }

    const basicDepartment = (departmentExists as any[])[0];

    // Then check if department_details table exists
    try {
      const detailsTableExists = await query("SHOW TABLES LIKE 'department_details'");
      
      if ((detailsTableExists as any[]).length === 0) {
        console.log("department_details table does not exist, returning basic department data");
        // Return just the basic department data if details table doesn't exist
        return NextResponse.json({
          ...basicDepartment,
          // Add empty values for expected fields to prevent form errors
          Establishment_Year: null,
          Department_Code: "",
          Email_ID: "",
          Department_Phone_Number: "",
          HOD_ID: null,
          Vision: "",
          Mission: "",
          Total_Faculty: 0,
          Total_Students: 0,
          Website_URL: "",
          Notable_Achievements: "",
          Industry_Collaboration: "",
          Research_Focus_Area: ""
        });
      }
    } catch (error) {
      console.error("Error checking department_details table:", error);
    }

    // Try to get the department with details
    const department = await query(
      `
      SELECT 
        d.*,
        dd.*
      FROM department d
      LEFT JOIN department_details dd ON d.Department_ID = dd.Department_ID
      WHERE d.Department_ID = ?
      `,
      [id]
    );

    // If we have data with details, return it
    if (department && (department as any[]).length > 0) {
      const departmentData = (department as any[])[0];
      
      // Get HOD information if available
      let hodInfo = null;
      if (departmentData.HOD_ID) {
        try {
          const facultyQuery = await query("SELECT F_id, F_name FROM faculty WHERE F_id = ?", [departmentData.HOD_ID]);
          if ((facultyQuery as any[]).length > 0) {
            const faculty = (facultyQuery as any[])[0];
            hodInfo = {
              id: faculty.F_id,
              name: faculty.F_name
            };
          } else {
            hodInfo = {
              id: departmentData.HOD_ID,
              name: "Unknown Faculty"
            };
          }
        } catch (error) {
          console.error("Error processing HOD information:", error);
          hodInfo = {
            id: departmentData.HOD_ID,
            name: "Unknown Faculty"
          };
        }
      }
      
      return NextResponse.json({
        ...departmentData,
        HOD: hodInfo
      });
    }

    // If we don't have details but department exists, return department with empty details
    console.log(`Department found but no details for ID ${id}`);
    return NextResponse.json({
      ...basicDepartment,
      // Add empty values for expected fields to prevent form errors
      Establishment_Year: null,
      Department_Code: "",
      Email_ID: "",
      Department_Phone_Number: "",
      HOD_ID: null,
      Vision: "",
      Mission: "",
      Total_Faculty: 0,
      Total_Students: 0,
      Website_URL: "",
      Notable_Achievements: "",
      Industry_Collaboration: "",
      Research_Focus_Area: ""
    });
  } catch (error) {
    console.error("Error fetching department:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching department data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`Updating department data for ID: ${id}`);
    const body = await request.json();
    const {
      Department_Name,
      Establishment_Year,
      Department_Code,
      Email_ID,
      Department_Phone_Number,
      HOD_ID,
      Vision,
      Mission,
      Total_Faculty,
      Total_Students,
      Website_URL,
      Notable_Achievements,
      Industry_Collaboration,
      Research_Focus_Area,
    } = body;

    console.log("Received data for update:", body);

    // Update department table
    try {
      await query(
        `
        UPDATE department 
        SET Department_Name = ?
        WHERE Department_ID = ?
      `,
        [Department_Name, id]
      );
      console.log(`Successfully updated basic department info for ID ${id}`);
    } catch (error) {
      console.error("Error updating department table:", error);
      throw new Error(`Failed to update department: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Check if department_details table exists
    try {
      const detailsTableExists = await query("SHOW TABLES LIKE 'department_details'");
      
      if ((detailsTableExists as any[]).length === 0) {
        console.log("department_details table doesn't exist, creating it");
        // Create the table
        await query(`
          CREATE TABLE department_details (
            id INT NOT NULL AUTO_INCREMENT,
            Department_ID INT NOT NULL,
            Establishment_Year YEAR,
            Department_Code VARCHAR(50),
            Email_ID VARCHAR(255),
            Department_Phone_Number VARCHAR(15),
            HOD_ID BIGINT,
            Vision TEXT,
            Mission TEXT,
            Total_Faculty INT,
            Total_Students INT,
            Website_URL VARCHAR(255),
            Notable_Achievements TEXT,
            Industry_Collaboration TEXT,
            Research_Focus_Area TEXT,
            PRIMARY KEY (id),
            FOREIGN KEY (Department_ID) REFERENCES department(Department_ID) ON DELETE CASCADE
          )
        `);
        console.log("department_details table created successfully");
      }
    } catch (error) {
      console.error("Error checking/creating department_details table:", error);
      // Don't throw here, try to continue
    }

    // Check if record exists in department_details for this department
    try {
      const details = await query(
        `SELECT 1 FROM department_details WHERE Department_ID = ? LIMIT 1`,
        [id]
      );

      if ((details as any[]).length === 0) {
        // Insert new record
        console.log(`Creating new department_details record for department ID ${id}`);
        await query(
          `
          INSERT INTO department_details (
            Department_ID,
            Establishment_Year,
            Department_Code,
            Email_ID,
            Department_Phone_Number,
            HOD_ID,
            Vision,
            Mission,
            Total_Faculty,
            Total_Students,
            Website_URL,
            Notable_Achievements,
            Industry_Collaboration,
            Research_Focus_Area
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            id,
            Establishment_Year,
            Department_Code,
            Email_ID,
            Department_Phone_Number,
            HOD_ID,
            Vision,
            Mission,
            Total_Faculty,
            Total_Students,
            Website_URL,
            Notable_Achievements,
            Industry_Collaboration,
            Research_Focus_Area,
          ]
        );
        console.log(`Department details record created successfully for ID ${id}`);
      } else {
        // Update existing record
        console.log(`Updating department_details for department ID ${id}`);
        await query(
          `
          UPDATE department_details 
          SET 
            Establishment_Year = ?,
            Department_Code = ?,
            Email_ID = ?,
            Department_Phone_Number = ?,
            HOD_ID = ?,
            Vision = ?,
            Mission = ?,
            Total_Faculty = ?,
            Total_Students = ?,
            Website_URL = ?,
            Notable_Achievements = ?,
            Industry_Collaboration = ?,
            Research_Focus_Area = ?
          WHERE Department_ID = ?
          `,
          [
            Establishment_Year,
            Department_Code,
            Email_ID,
            Department_Phone_Number,
            HOD_ID,
            Vision,
            Mission,
            Total_Faculty,
            Total_Students,
            Website_URL,
            Notable_Achievements,
            Industry_Collaboration,
            Research_Focus_Area,
            id,
          ]
        );
        console.log(`Department details updated successfully for ID ${id}`);
      }
    } catch (error) {
      console.error("Error updating department details:", error);
      throw new Error(`Failed to update department details: ${error instanceof Error ? error.message : String(error)}`);
    }

    return NextResponse.json({
      success: true,
      message: "Department updated successfully",
    });
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating department",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`Attempting to delete department with ID: ${id}`);

    // Check if department exists
    const departmentExists = await query(
      `SELECT * FROM department WHERE Department_ID = ?`,
      [id]
    );

    if (!departmentExists || !(departmentExists as any[]).length) {
      return NextResponse.json(
        {
          success: false,
          message: "Department not found",
        },
        { status: 404 }
      );
    }

    // Check for faculty assigned to this department
    const facultyInDepartment = await query(
      `SELECT COUNT(*) as count FROM faculty WHERE F_dept = (SELECT Department_Name FROM department WHERE Department_ID = ?)`,
      [id]
    );

    const facultyCount = (facultyInDepartment as any[])[0].count;
    
    if (facultyCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete department with ${facultyCount} faculty member(s) assigned to it. Please reassign faculty first.`,
        },
        { status: 400 }
      );
    }

    // First delete from department_details if exists
    try {
      await query(
        `DELETE FROM department_details WHERE Department_ID = ?`,
        [id]
      );
    } catch (error) {
      console.error("Error deleting department details (might not exist):", error);
      // Continue even if this fails
    }

    // Then delete the department
    await query(
      `DELETE FROM department WHERE Department_ID = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error deleting department",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 