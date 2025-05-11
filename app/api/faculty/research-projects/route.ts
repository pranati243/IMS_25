import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
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

    // Get faculty ID from username if user is faculty
    const username = authData.user.username;
    let facultyId = null;

    if (authData.user.role === "faculty") {
      // Get faculty ID for the logged-in user
      const facultyResult = (await query(
        "SELECT F_id FROM faculty WHERE F_id = ?",
        [username]
      )) as any[];

      if (
        !facultyResult ||
        !Array.isArray(facultyResult) ||
        facultyResult.length === 0
      ) {
        return NextResponse.json(
          { success: false, message: "Faculty record not found" },
          { status: 404 }
        );
      }

      facultyId = facultyResult[0].F_id;
    }

    // For admin or HOD roles, allow querying for any faculty
    const queryFacultyId =
      request.nextUrl.searchParams.get("facultyId") || facultyId;

    if (!queryFacultyId) {
      return NextResponse.json(
        { success: false, message: "Faculty ID is required" },
        { status: 400 }
      );
    }

    // Check if table exists and fetch research projects
    try {
      // Verify table exists
      const tableCheck = await query(
        "SHOW TABLES LIKE 'faculty_research_projects'"
      );

      if ((tableCheck as any[]).length === 0) {
        // Return an empty array if the table doesn't exist yet
        return NextResponse.json({
          success: true,
          data: [],
          message: "No research projects found (table doesn't exist)",
        });
      }

      // Table exists, fetch research projects
      const projects = (await query(
        `SELECT 
          id,
          faculty_id,
          title,
          description,
          start_date,
          end_date,
          status,
          funding_agency,
          funding_amount
        FROM 
          faculty_research_projects
        WHERE 
          faculty_id = ?
        ORDER BY 
          start_date DESC`,
        [queryFacultyId]
      )) as any[];

      console.log(
        `Found ${projects.length} research projects for faculty ID ${queryFacultyId}`
      );

      // Return the research projects data
      return NextResponse.json({
        success: true,
        data: projects,
      });
    } catch (error) {
      console.error(
        "Error checking/querying faculty_research_projects table:",
        error
      );
      return NextResponse.json({
        success: true,
        data: [],
        error: "Database error when fetching research projects",
      });
    }
  } catch (error) {
    console.error("Error fetching faculty research projects:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch research projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Only faculty or admin can add research projects
    if (
      authData.user.role !== "faculty" &&
      authData.user.role !== "admin" &&
      authData.user.role !== "hod"
    ) {
      return NextResponse.json(
        { success: false, message: "Permission denied" },
        { status: 403 }
      );
    }

    // Get faculty ID for the faculty user
    let facultyId = request.nextUrl.searchParams.get("facultyId");

    if (!facultyId && authData.user.role === "faculty") {
      // Use the logged-in user's faculty ID
      const facultyResult = (await query(
        "SELECT F_id FROM faculty WHERE F_id = ?",
        [authData.user.username]
      )) as any[];

      if (Array.isArray(facultyResult) && facultyResult.length > 0) {
        facultyId = facultyResult[0].F_id;
      }
    }

    if (!facultyId) {
      return NextResponse.json(
        { success: false, message: "Faculty ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body as JSON
    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      status = "Ongoing",
      fundingAgency,
      fundingAmount,
    } = body;

    // Validate required fields
    if (!title || !startDate) {
      return NextResponse.json(
        { success: false, message: "Title and start date are required" },
        { status: 400 }
      );
    }

    // Ensure the faculty_research_projects table exists
    try {
      const tableCheck = await query(
        "SHOW TABLES LIKE 'faculty_research_projects'"
      );

      if ((tableCheck as any[]).length === 0) {
        // Create the table if it doesn't exist
        await query(`
          CREATE TABLE faculty_research_projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            faculty_id VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            start_date DATE NOT NULL,
            end_date DATE,
            status VARCHAR(50) NOT NULL,
            funding_agency VARCHAR(255),
            funding_amount DECIMAL(15,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (faculty_id) REFERENCES faculty(F_id) ON DELETE CASCADE
          )
        `);
      }

      // Insert the research project
      const result = await query(
        `INSERT INTO faculty_research_projects 
          (faculty_id, title, description, start_date, end_date, status, funding_agency, funding_amount) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          facultyId,
          title,
          description || null,
          startDate,
          endDate || null,
          status,
          fundingAgency || null,
          fundingAmount || null,
        ]
      );

      // Return success response
      return NextResponse.json({
        success: true,
        message: "Research project added successfully",
        data: {
          id: (result as any).insertId,
          faculty_id: facultyId,
          title,
          description,
          start_date: startDate,
          end_date: endDate,
          status,
          funding_agency: fundingAgency,
          funding_amount: fundingAmount,
        },
      });
    } catch (error) {
      console.error("Error adding research project:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to add research project",
          error: String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in research projects API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
