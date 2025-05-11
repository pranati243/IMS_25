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

    // Check if table exists and fetch awards
    try {
      // Verify table exists
      const tableCheck = await query("SHOW TABLES LIKE 'faculty_awards'");

      if ((tableCheck as any[]).length === 0) {
        // Return an empty array if the table doesn't exist yet
        return NextResponse.json({
          success: true,
          data: [],
          message: "No awards found (table doesn't exist)",
        });
      }

      // Table exists, fetch awards
      const awards = (await query(
        `SELECT 
          id,
          faculty_id,
          title,
          awarding_organization as organization,
          description,
          award_date as date,
          category
        FROM 
          faculty_awards
        WHERE 
          faculty_id = ?
        ORDER BY 
          award_date DESC`,
        [queryFacultyId]
      )) as RowDataPacket[];

      // Also check for award entries in faculty_contributions
      let allAwards = [...awards];

      try {
        const contributionAwards = (await query(
          `SELECT 
            Contribution_ID as id,
            F_ID as faculty_id,
            Description as title,
            Recognized_By as organization,
            Award_Received as description,
            Contribution_Date as date,
            Contribution_Type as category
          FROM 
            faculty_contributions
          WHERE 
            F_ID = ? AND 
            (
              Contribution_Type LIKE '%award%' OR 
              Contribution_Type LIKE '%achievement%' OR 
              Contribution_Type LIKE '%recognition%'
            )
          ORDER BY 
            Contribution_Date DESC`,
          [queryFacultyId]
        )) as RowDataPacket[];

        if (
          contributionAwards &&
          Array.isArray(contributionAwards) &&
          contributionAwards.length > 0
        ) {
          allAwards = [...allAwards, ...contributionAwards];
        }
      } catch (error) {
        console.error("Error fetching awards from contributions table:", error);
        // Continue execution - don't fail if this query has issues
      }

      return NextResponse.json({
        success: true,
        data: allAwards,
      });
    } catch (error) {
      console.error("Error checking/querying faculty_awards table:", error);
      return NextResponse.json({
        success: true,
        data: [],
        error: "Database error when fetching awards",
      });
    }
  } catch (error) {
    console.error("Error fetching faculty awards:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch awards" },
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

    // Only faculty or admin can add awards
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
      awarding_organization,
      description,
      award_date,
      category = "Achievement",
    } = body;

    // Validate required fields
    if (!title || !awarding_organization || !award_date) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, awarding organization, and date are required",
        },
        { status: 400 }
      );
    }

    // Ensure the faculty_awards table exists
    try {
      const tableCheck = await query("SHOW TABLES LIKE 'faculty_awards'");

      if ((tableCheck as any[]).length === 0) {
        // Create the table if it doesn't exist
        await query(`
          CREATE TABLE faculty_awards (
            id INT AUTO_INCREMENT PRIMARY KEY,
            faculty_id VARCHAR(50) NOT NULL,
            title VARCHAR(255) NOT NULL,
            awarding_organization VARCHAR(255) NOT NULL,
            description TEXT,
            award_date DATE NOT NULL,
            category VARCHAR(50) DEFAULT 'Achievement',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (faculty_id) REFERENCES faculty(F_id) ON DELETE CASCADE
          )
        `);
      }

      // Insert the award
      const result = (await query(
        `INSERT INTO faculty_awards 
          (faculty_id, title, awarding_organization, description, award_date, category) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          facultyId,
          title,
          awarding_organization,
          description || null,
          award_date,
          category,
        ]
      )) as RowDataPacket;

      // Return success response
      return NextResponse.json({
        success: true,
        message: "Award added successfully",
        data: {
          id: result.insertId,
          faculty_id: facultyId,
          title,
          organization: awarding_organization, // Return field name consistent with GET
          description,
          date: award_date, // Return field name consistent with GET
          category,
        },
      });
    } catch (error) {
      console.error("Error adding award:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to add award",
          error: String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in awards API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
