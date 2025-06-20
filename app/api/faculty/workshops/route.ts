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
      )) as RowDataPacket[];

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

    // Check if table exists and fetch workshops
    try {
      // Verify table exists
      const tableCheck = await query("SHOW TABLES LIKE 'faculty_workshops'");

      if ((tableCheck as any[]).length === 0) {
        // Return an empty array if the table doesn't exist yet
        return NextResponse.json({
          success: true,
          data: [],
          message: "No workshops found (table doesn't exist)",
        });
      }

      // Table exists, fetch workshops - first from workshops table
      const workshops = (await query(
        `SELECT 
          id,
          faculty_id,
          title,
          description,
          start_date,
          end_date,
          venue,
          type,
          role
        FROM 
          faculty_workshops
        WHERE 
          faculty_id = ?
        ORDER BY 
          start_date DESC`,
        [queryFacultyId]
      )) as RowDataPacket[];

      // Check for workshop-like entries in contributions table
      let allWorkshops = [...workshops];

      try {
        const workshopContributions = (await query(
          `SELECT 
            Contribution_ID as id,
            F_ID as faculty_id,
            Description as title,
            Remarks as description,
            Contribution_Date as start_date,
            Contribution_Date as end_date,
            Recognized_By as venue,
            Contribution_Type as type,
            'Participant' as role
          FROM 
            faculty_contributions
          WHERE 
            F_ID = ? AND 
            (
              Contribution_Type LIKE '%workshop%' OR 
              Contribution_Type LIKE '%seminar%' OR 
              Contribution_Type LIKE '%conference%' OR
              Contribution_Type LIKE '%training%'
            )
          ORDER BY 
            Contribution_Date DESC`,
          [queryFacultyId]
        )) as RowDataPacket[];

        if (
          workshopContributions &&
          Array.isArray(workshopContributions) &&
          workshopContributions.length > 0
        ) {
          allWorkshops = [...allWorkshops, ...workshopContributions];
        }
      } catch (error) {
        console.error(
          "Error fetching workshops from contributions table:",
          error
        );
        // Continue execution - don't fail if this table doesn't exist
      }

      return NextResponse.json({
        success: true,
        data: allWorkshops,
      });
    } catch (error) {
      console.error("Error checking/querying faculty_workshops table:", error);
      return NextResponse.json({
        success: true,
        data: [],
        error: "Database error when fetching workshops",
      });
    }
  } catch (error) {
    console.error("Error fetching faculty workshops:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch workshops" },
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

    // Only faculty or admin can add workshops
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
      )) as RowDataPacket[];

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
      start_date,
      end_date,
      venue,
      type = "Workshop",
      role = "Participant",
    } = body;

    // Validate required fields
    if (!title || !start_date || !venue) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, start date, and venue are required",
        },
        { status: 400 }
      );
    }

    // Ensure the faculty_workshops table exists
    try {
      const tableCheck = await query("SHOW TABLES LIKE 'faculty_workshops'");

      if ((tableCheck as any[]).length === 0) {
        // Create the table if it doesn't exist
        await query(`
          CREATE TABLE faculty_workshops (
            id INT AUTO_INCREMENT PRIMARY KEY,
            faculty_id BIGINT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            start_date DATE NOT NULL,
            end_date DATE,
            venue VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            role VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (faculty_id) REFERENCES faculty(F_id) ON DELETE CASCADE
          )
        `);
      }

      // Insert the workshop
      const result = (await query(
        `INSERT INTO faculty_workshops 
          (faculty_id, title, description, start_date, end_date, venue, type, role) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          facultyId,
          title,
          description || null,
          start_date,
          end_date || null,
          venue,
          type,
          role,
        ]
      )) as RowDataPacket;

      // Return success response
      return NextResponse.json({
        success: true,
        message: "Workshop added successfully",
        data: {
          id: result.insertId,
          faculty_id: facultyId,
          title,
          description,
          start_date: start_date,
          end_date: end_date,
          venue,
          type,
          role,
        },
      });
    } catch (error) {
      console.error("Error adding workshop:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to add workshop",
          error: String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in workshops API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
