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

    // Check if table exists and fetch publications
    try {
      // Verify table exists
      const tableCheck = await query("SHOW TABLES LIKE 'paper_publication'");

      if ((tableCheck as any[]).length === 0) {
        // Return an empty array if the table doesn't exist yet
        return NextResponse.json({
          success: true,
          data: [],
          message: "No publications found (table doesn't exist)",
        });
      }

      // Table exists, fetch publications
      const publications = await query(
        `SELECT 
          id as publication_id,
          id as f_id,
          title_of_the_paper,
          name_of_the_conference,
          Year_Of_Study,
          paper_link
        FROM 
          paper_publication
        WHERE 
          id = ?
        ORDER BY 
          Year_Of_Study DESC`,
        [queryFacultyId]
      );

      console.log(
        `Found ${
          (publications as any[]).length
        } publications for faculty ID ${queryFacultyId}`
      );

      return NextResponse.json({
        success: true,
        data: publications,
      });
    } catch (error) {
      console.error("Error checking/querying paper_publication table:", error);
      return NextResponse.json({
        success: true,
        data: [],
        error: "Database error when fetching publications",
      });
    }
  } catch (error) {
    console.error("Error fetching faculty publications:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch publications" },
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

    // Only faculty, HOD, and admin can add publications
    if (!["faculty", "hod", "admin"].includes(authData.user.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to add publications" },
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
      title_of_the_paper,
      name_of_the_conference,
      Year_Of_Study,
      paper_link,
      f_id,
    } = await request.json();

    // For faculty role, ensure they can only add their own publications
    const publicationFacultyId =
      authData.user.role === "faculty" ? facultyId : f_id;

    if (!publicationFacultyId) {
      return NextResponse.json(
        { success: false, message: "Faculty ID is required" },
        { status: 400 }
      );
    }

    if (!title_of_the_paper || !name_of_the_conference || !Year_Of_Study) {
      return NextResponse.json(
        {
          success: false,
          message: "Publication title, conference name, and year are required",
        },
        { status: 400 }
      );
    }

    // Insert the publication
    const result = await query(
      `INSERT INTO paper_publication 
        (id, title_of_the_paper, name_of_the_conference, Year_Of_Study, paper_link) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        publicationFacultyId,
        title_of_the_paper,
        name_of_the_conference,
        Year_Of_Study,
        paper_link || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Publication added successfully",
      data: {
        id: (result as any).insertId,
        f_id: publicationFacultyId,
        title_of_the_paper,
        name_of_the_conference,
        Year_Of_Study,
        paper_link,
      },
    });
  } catch (error) {
    console.error("Error adding publication:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add publication" },
      { status: 500 }
    );
  }
}
