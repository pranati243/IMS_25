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

    // Check if table exists and fetch memberships
    try {
      // Verify table exists
      const tableCheck = await query(
        "SHOW TABLES LIKE 'faculty_professional_body'"
      );

      if ((tableCheck as any[]).length === 0) {
        // Return an empty array if the table doesn't exist yet
        return NextResponse.json({
          success: true,
          data: [],
          message: "No memberships found (table doesn't exist)",
        });
      }

      // Table exists, fetch memberships
      const memberships = await query(
        `SELECT 
          SrNo,
          F_ID,
          Organization_Name,
          Membership_Type,
          Membership_ID,
          Start_Date,
          End_Date
        FROM 
          faculty_professional_body
        WHERE 
          F_ID = ?
        ORDER BY 
          Start_Date DESC`,
        [queryFacultyId]
      );

      return NextResponse.json({
        success: true,
        data: memberships,
      });
    } catch (error) {
      console.error(
        "Error checking/querying faculty_professional_body table:",
        error
      );
      return NextResponse.json({
        success: true,
        data: [],
        error: "Database error when fetching memberships",
      });
    }
  } catch (error) {
    console.error("Error fetching faculty memberships:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch memberships" },
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

    // Only faculty, HOD, and admin can add memberships
    if (!["faculty", "hod", "admin"].includes(authData.user.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to add memberships" },
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
      Organization_Name,
      Membership_Type,
      Membership_ID,
      Start_Date,
      End_Date,
      F_ID,
    } = await request.json();

    // For faculty role, ensure they can only add their own memberships
    const membershipFacultyId =
      authData.user.role === "faculty" ? facultyId : F_ID;

    if (!membershipFacultyId) {
      return NextResponse.json(
        { success: false, message: "Faculty ID is required" },
        { status: 400 }
      );
    }

    if (!Organization_Name || !Membership_Type || !Start_Date) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Organization name, membership type, and start date are required",
        },
        { status: 400 }
      );
    }

    // Check if the table exists, create it if it doesn't
    const tableCheck = await query(
      "SHOW TABLES LIKE 'faculty_professional_body'"
    );

    if ((tableCheck as any[]).length === 0) {
      // Create the table if it doesn't exist
      await query(`
        CREATE TABLE faculty_professional_body (
          SrNo INT AUTO_INCREMENT PRIMARY KEY,
          F_ID VARCHAR(50) NOT NULL,
          Organization_Name VARCHAR(255) NOT NULL,
          Membership_Type VARCHAR(100) NOT NULL,
          Membership_ID VARCHAR(100),
          Start_Date DATE NOT NULL,
          End_Date DATE,
          FOREIGN KEY (F_ID) REFERENCES faculty(F_id)
        )
      `);
    }

    // Insert the membership
    const result = await query(
      `INSERT INTO faculty_professional_body 
        (F_ID, Organization_Name, Membership_Type, Membership_ID, Start_Date, End_Date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        membershipFacultyId,
        Organization_Name,
        Membership_Type,
        Membership_ID || null,
        Start_Date,
        End_Date || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Membership added successfully",
      data: {
        SrNo: (result as any).insertId,
        F_ID: membershipFacultyId,
        Organization_Name,
        Membership_Type,
        Membership_ID,
        Start_Date,
        End_Date,
      },
    });
  } catch (error) {
    console.error("Error adding membership:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add membership" },
      { status: 500 }
    );
  }
}
