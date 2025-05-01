import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { OkPacket } from "mysql2";

export async function GET(request: Request) {
  const diagnosticMode = request.url.includes("diagnostic=true");
  const diagnosticInfo: Record<string, any> = {};
  
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const search = searchParams.get("search");

    // Step 1: Verify faculty table exists
    try {
      const tableCheck = await query("SHOW TABLES LIKE 'faculty'");
      diagnosticInfo.tableCheck = { faculty: (tableCheck as any[]).length > 0 };
      
      if ((tableCheck as any[]).length === 0) {
        throw new Error("Faculty table does not exist");
      }
    } catch (error) {
      console.error("Faculty table check error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Faculty table not found or inaccessible",
          error: error instanceof Error ? error.message : "Unknown error",
          diagnostic: diagnosticInfo
        },
        { status: 500 }
      );
    }
    
    // Step 2: Build the query with proper error handling for joins
    let sql = `
      SELECT 
        f.F_id,
        f.F_name,
        f.F_dept
    `;
    
    // Check if faculty_details table exists before adding its columns
    let hasDetailsTable = false;
    try {
      const detailsCheck = await query("SHOW TABLES LIKE 'faculty_details'");
      hasDetailsTable = (detailsCheck as any[]).length > 0;
      
      diagnosticInfo.tableCheck = { 
        ...diagnosticInfo.tableCheck,
        faculty_details: hasDetailsTable 
      };
      
      if (hasDetailsTable) {
        // Get the actual column names to avoid errors
        const detailsColumns = await query("SHOW COLUMNS FROM faculty_details");
        const columnNames = (detailsColumns as any[]).map(col => col.Field);
        
        // Only include columns that actually exist
        const emailCol = columnNames.includes('Email') ? 'fd.Email' : 'NULL as Email';
        const phoneCol = columnNames.includes('Phone_Number') ? 'fd.Phone_Number' : 'NULL as Phone_Number';
        const designationCol = columnNames.includes('Current_Designation') ? 'fd.Current_Designation' : 'NULL as Current_Designation';
        const degreeCol = columnNames.includes('Highest_Degree') ? 'fd.Highest_Degree' : 'NULL as Highest_Degree';
        const experienceCol = columnNames.includes('Experience') ? 'fd.Experience' : 'NULL as Experience';
        
        sql += `,
          ${emailCol},
          ${phoneCol},
          ${designationCol},
          ${degreeCol},
          ${experienceCol}`;
      } else {
        // Add placeholder columns if table doesn't exist
        sql += `,
          NULL as Email,
          NULL as Phone_Number,
          NULL as Current_Designation,
          NULL as Highest_Degree,
          NULL as Experience`;
      }
    } catch (error) {
      console.error("Faculty details check error:", error);
      // Continue with placeholders for these columns
      sql += `,
        NULL as Email,
        NULL as Phone_Number,
        NULL as Current_Designation,
        NULL as Highest_Degree,
        NULL as Experience`;
    }
    
    // Add contribution and professional membership counts with safe column names
    sql += `,
      0 as total_contributions,
      0 as professional_memberships
    `;
    
    // Main table
    sql += `FROM faculty f`;
    
    // Add LEFT JOINs conditionally
    let hasDetailsJoin = false;
    try {
      const detailsCheck = await query("SHOW TABLES LIKE 'faculty_details'");
      if ((detailsCheck as any[]).length > 0) {
        sql += ` LEFT JOIN faculty_details fd ON f.F_id = fd.F_ID`;
        hasDetailsJoin = true;
      }
    } catch (error) {
      console.error("Error checking faculty_details for JOIN:", error);
      // Skip the join if there's an error
    }
    
    // Check for contributions table - don't join it yet since we're not using its columns
    let hasContributions = false;
    try {
      const contributionsCheck = await query("SHOW TABLES LIKE 'faculty_contributions'");
      diagnosticInfo.tableCheck = { 
        ...diagnosticInfo.tableCheck,
        faculty_contributions: (contributionsCheck as any[]).length > 0 
      };
      
      hasContributions = (contributionsCheck as any[]).length > 0;
    } catch (error) {
      console.error("Error checking faculty_contributions:", error);
    }
    
    // Check for professional_body table - don't join it yet since we're not using its columns
    let hasProfessionalBody = false;
    try {
      const professionalBodyCheck = await query("SHOW TABLES LIKE 'faculty_professional_body'");
      diagnosticInfo.tableCheck = { 
        ...diagnosticInfo.tableCheck,
        faculty_professional_body: (professionalBodyCheck as any[]).length > 0 
      };
      
      hasProfessionalBody = (professionalBodyCheck as any[]).length > 0;
    } catch (error) {
      console.error("Error checking faculty_professional_body:", error);
    }

    const params: (string | number | boolean | null)[] = [];
    const conditions = [];

    if (department) {
      conditions.push("f.F_dept = ?");
      params.push(department);
    }

    if (search) {
      // Check if we have fd in the query
      if (hasDetailsJoin) {
        conditions.push("(f.F_name LIKE ? OR fd.Email LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
      } else {
        conditions.push("f.F_name LIKE ?");
        params.push(`%${search}%`);
      }
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    // Ensure the GROUP BY only includes columns that exist in the query
    sql += " GROUP BY f.F_id, f.F_name, f.F_dept";
    
    // Add additional GROUP BY columns if we know they exist
    if (hasDetailsJoin) {
      sql += ", fd.Email, fd.Phone_Number, fd.Current_Designation, fd.Highest_Degree, fd.Experience";
    }

    // Execute the query
    diagnosticInfo.sql = sql;
    diagnosticInfo.params = params;

    const faculty = await query(sql, params);
    diagnosticInfo.querySuccess = true;
    diagnosticInfo.resultCount = (faculty as any[]).length;

    return NextResponse.json({
      success: true,
      data: faculty,
      diagnostic: diagnosticMode ? diagnosticInfo : undefined
    });
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching faculty data",
        error: error instanceof Error ? error.message : "Unknown error",
        diagnostic: diagnosticInfo
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { F_name, F_dept } = body;

    if (!F_name || !F_dept) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and department are required",
        },
        { status: 400 }
      );
    }

    try {
      // Insert into faculty table
      const result = (await query(
        `
        INSERT INTO faculty (F_name, F_dept)
        VALUES (?, ?)
      `,
        [F_name, F_dept]
      )) as OkPacket;

      return NextResponse.json({
        success: true,
        F_id: result.insertId,
      });
    } catch (insertError) {
      // If the error is related to auto_increment not set up, try to fix it
      if (
        insertError instanceof Error &&
        insertError.message.includes("ER_NO_DEFAULT_FOR_FIELD") &&
        insertError.message.includes("F_id")
      ) {
        // First alter the table to add AUTO_INCREMENT to F_id
        await query(
          "ALTER TABLE faculty MODIFY F_id bigint NOT NULL AUTO_INCREMENT"
        );

        // Then retry the insert
        const result = (await query(
          `
          INSERT INTO faculty (F_name, F_dept)
          VALUES (?, ?)
        `,
          [F_name, F_dept]
        )) as OkPacket;

        return NextResponse.json({
          success: true,
          F_id: result.insertId,
        });
      } else {
        // If it's another kind of error, rethrow it
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error adding faculty:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error adding faculty",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
