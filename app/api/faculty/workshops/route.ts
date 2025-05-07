import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

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
      const facultyResult = await query(
        "SELECT F_id FROM faculty WHERE F_id = ?",
        [username]
      );

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

      // Table exists, fetch workshops
      const workshops = await query(
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
      );

      return NextResponse.json({
        success: true,
        data: workshops,
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

    // Only faculty, HOD, and admin can add workshops
    if (!["faculty", "hod", "admin"].includes(authData.user.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to add workshops" },
        { status: 403 }
      );
    }

    // Get faculty ID from username if user is faculty
    const username = authData.user.username;
    let facultyId = null;

    if (authData.user.role === "faculty") {
      // Get faculty ID for the logged-in user
      const facultyResult = await query(
        "SELECT F_id FROM faculty WHERE F_id = ?",
        [username]
      );

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

    // Parse request body
    const {
      title,
      description,
      start_date,
      end_date,
      venue,
      type,
      role,
      faculty_id,
    } = await request.json();

    // For faculty role, ensure they can only add their own workshops
    const workshopFacultyId =
      authData.user.role === "faculty" ? facultyId : faculty_id;

    if (!workshopFacultyId) {
      return NextResponse.json(
        { success: false, message: "Faculty ID is required" },
        { status: 400 }
      );
    }

    if (!title || !description || !start_date || !venue || !type || !role) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, description, start date, venue, type, and role are required",
        },
        { status: 400 }
      );
    }

    // Check if the table exists, create it if it doesn't
    const tableCheck = await query("SHOW TABLES LIKE 'faculty_workshops'");

    if ((tableCheck as any[]).length === 0) {
      // Create the table if it doesn't exist
      await query(`
        CREATE TABLE faculty_workshops (
          id INT AUTO_INCREMENT PRIMARY KEY,
          faculty_id VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          start_date DATE NOT NULL,
          end_date DATE,
          venue VARCHAR(255) NOT NULL,
          type ENUM('workshop', 'conference', 'seminar') NOT NULL,
          role ENUM('attendee', 'presenter', 'organizer') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (faculty_id) REFERENCES faculty(F_id) ON DELETE CASCADE
        )
      `);
    }

    // Insert the workshop
    const result = await query(
      `INSERT INTO faculty_workshops 
        (faculty_id, title, description, start_date, end_date, venue, type, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        workshopFacultyId,
        title,
        description,
        start_date,
        end_date || null,
        venue,
        type,
        role,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Workshop added successfully",
      data: {
        id: (result as any).insertId,
        faculty_id: workshopFacultyId,
        title,
        description,
        start_date,
        end_date,
        venue,
        type,
        role,
      },
    });
  } catch (error) {
    console.error("Error adding workshop:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add workshop" },
      { status: 500 }
    );
  }
}
