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
        { success: false, message: "User not found" },
        { status: 401 }
      );
    }

    // Get faculty ID
    const userFacultyResponse = await fetch(
      `${request.nextUrl.origin}/api/faculty/me`,
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    let facultyId: number | null = null;

    if (userFacultyResponse.ok) {
      const userFacultyData = await userFacultyResponse.json();
      if (userFacultyData.success && userFacultyData.faculty) {
        facultyId = userFacultyData.faculty.F_id;
      }
    }

    if (!facultyId) {
      return NextResponse.json(
        { success: false, message: "Faculty information not found" },
        { status: 404 }
      );
    }

    // Get workshop data from request
    const data = await request.json();

    // Required fields
    if (!data.title || !data.venue || !data.type || !data.start_date) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert into faculty_workshops table
    const result = await query(
      `
      INSERT INTO faculty_workshops (
        faculty_id, 
        title, 
        description, 
        venue, 
        type, 
        role,
        start_date, 
        end_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        facultyId,
        data.title,
        data.description || null,
        data.venue,
        data.type,
        data.role || "Attendee",
        new Date(data.start_date),
        data.end_date ? new Date(data.end_date) : null
      ]
    );
    
    // Update workshops count in faculty information
    try {
      // First, try to increment the workshops_attended count directly in the faculty table
      await query(
        `
        UPDATE faculty 
        SET workshops_attended = COALESCE(workshops_attended, 0) + 1
        WHERE F_id = ?
        `,
        [facultyId]
      );
    } catch (updateError) {
      console.error("Error updating workshops count:", updateError);
      // If above fails, try implementing a workaround by fetching current count
      try {
        // First get the current count of workshops from faculty_workshops table
        const workshopCountResult = await query(
          `
          SELECT COUNT(*) as count 
          FROM faculty_workshops
          WHERE faculty_id = ?
          `,
          [facultyId]
        ) as RowDataPacket[];
        
        const workshopCount = workshopCountResult[0]?.count || 1;
        
        // Then update the workshops_attended field with the actual count
        await query(
          `
          UPDATE faculty 
          SET workshops_attended = ?
          WHERE F_id = ?
          `,
          [workshopCount, facultyId]
        );
      } catch (secondUpdateError) {
        console.error("Error in workshop count workaround:", secondUpdateError);
        // Continue execution even if this fails - at least the workshop was added
      }
    }

    return NextResponse.json({
      success: true,
      message: "Workshop added successfully",
      data: { id: (result as any).insertId }
    });
  } catch (error) {
    console.error("Error in workshop creation:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to add workshop" 
      },
      { status: 500 }
    );
  }
}
