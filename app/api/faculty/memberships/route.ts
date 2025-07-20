import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Aggregate by organization if requested
    if (request.nextUrl.searchParams.get("aggregate") === "organization") {
      // Group by organization and count
      const orgCounts = await query(
        `SELECT organization, COUNT(*) as count FROM faculty_memberships GROUP BY organization ORDER BY count DESC`
      );
      return NextResponse.json({ success: true, data: orgCounts });
    }
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

      facultyId = (facultyResult[0] as any).F_id;
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
      const tableCheck = await query("SHOW TABLES LIKE 'faculty_memberships'");

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
          membership_id as SrNo,
          faculty_id as F_ID,
          organization,
          organization_category,
          membership_type as Membership_Type,
          membership_identifier as Membership_ID,
          certificate_url,
          start_date as Start_Date,
          end_date as End_Date,
          description
        FROM 
          faculty_memberships
        WHERE 
          faculty_id = ?
        ORDER BY 
          start_date DESC`,
        [queryFacultyId]
      );

      return NextResponse.json({
        success: true,
        data: memberships,
      });
    } catch (error) {
      console.error(
        "Error checking/querying faculty_memberships table:",
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

      facultyId = (facultyResult[0] as any).F_id;
    }

    // Parse request body
    const {
      organization,
      organization_category = "National", // Default to National if not provided
      Membership_Type,
      Membership_ID, // new, required
      Start_Date,
      End_Date,
      F_ID,
      certificate_url, // new, required
      description = "Faculty membership",
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

    if (
      !organization ||
      !Membership_Type ||
      !Membership_ID ||
      !certificate_url ||
      !Start_Date
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Organization name, membership type, membership ID, certificate, and start date are required",
        },
        { status: 400 }
      );
    }

    // Check if the table exists, create it if it doesn't
    const tableCheck = await query("SHOW TABLES LIKE 'faculty_memberships'");

    if ((tableCheck as any[]).length === 0) {
      // Create the table if it doesn't exist
      await query(`
        CREATE TABLE faculty_memberships (
          membership_id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
          faculty_id bigint(20) NOT NULL,
          organization varchar(255) NOT NULL,
          organization_category ENUM('National', 'International', 'Others') DEFAULT 'National',
          membership_type varchar(100) NOT NULL,
          membership_identifier varchar(100) NOT NULL,
          certificate_url varchar(255) NOT NULL,
          start_date date NOT NULL,
          end_date date DEFAULT NULL,
          description text DEFAULT NULL,
          created_at timestamp NULL DEFAULT current_timestamp(),
          updated_at timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
          FOREIGN KEY (faculty_id) REFERENCES faculty(F_id)
        )
      `);
    }

    // Insert the membership
    const result = await query(
      `INSERT INTO faculty_memberships 
        (faculty_id, organization, organization_category, membership_type, membership_identifier, certificate_url, start_date, end_date, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        membershipFacultyId,
        organization,
        organization_category,
        Membership_Type,
        Membership_ID,
        certificate_url,
        Start_Date,
        End_Date || null,
        description,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Membership added successfully",
      data: {
        membership_id: (result as any).insertId,
        faculty_id: membershipFacultyId,
        organization,
        organization_category,
        membership_type: Membership_Type,
        membership_identifier: Membership_ID,
        certificate_url,
        start_date: Start_Date,
        end_date: End_Date,
        description,
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
