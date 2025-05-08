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

    // Check if table exists and fetch contributions
    try {
      // Verify table exists
      const tableCheck = await query(
        "SHOW TABLES LIKE 'faculty_contributions'"
      );

      if ((tableCheck as any[]).length === 0) {
        // Return an empty array if the table doesn't exist yet
        return NextResponse.json({
          success: true,
          data: [],
          message: "No contributions found (table doesn't exist)",
        });
      }

      // Table exists, fetch contributions
      const contributions = await query(
        `SELECT 
          Contribution_ID,
          F_ID,
          Contribution_Type,
          Description,
          Contribution_Date
        FROM 
          faculty_contributions
        WHERE 
          F_ID = ?
        ORDER BY 
          Contribution_Date DESC`,
        [queryFacultyId]
      );

      return NextResponse.json({
        success: true,
        data: contributions,
      });
    } catch (error) {
      console.error(
        "Error checking/querying faculty_contributions table:",
        error
      );
      return NextResponse.json({
        success: true,
        data: [],
        error: "Database error when fetching contributions",
      });
    }
  } catch (error) {
    console.error("Error fetching faculty contributions:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch contributions" },
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

    // Only faculty, HOD, and admin can add contributions
    if (!["faculty", "hod", "admin"].includes(authData.user.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to add contributions" },
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
    const { contribution_type, description, date, f_id } = await request.json();

    // For faculty role, ensure they can only add their own contributions
    const contributionFacultyId =
      authData.user.role === "faculty" ? facultyId : f_id;

    if (!contributionFacultyId) {
      return NextResponse.json(
        { success: false, message: "Faculty ID is required" },
        { status: 400 }
      );
    }

    if (!contribution_type || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Contribution type and description are required",
        },
        { status: 400 }
      );
    }

    // Insert the contribution
    const result = await query(
      `INSERT INTO faculty_contributions 
        (F_ID, Contribution_Type, Description, Contribution_Date) 
       VALUES (?, ?, ?, ?)`,
      [
        contributionFacultyId,
        contribution_type,
        description,
        date || new Date(),
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Contribution added successfully",
      data: {
        id: (result as any).insertId,
        f_id: contributionFacultyId,
        contribution_type,
        description,
        date: date || new Date(),
      },
    });
  } catch (error) {
    console.error("Error adding faculty contribution:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add contribution" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // Only faculty, HOD, and admin can update contributions
    if (!["faculty", "hod", "admin"].includes(authData.user.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update contributions" },
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
    const { contribution_id, contribution_type, description, date } =
      await request.json();

    if (!contribution_id) {
      return NextResponse.json(
        { success: false, message: "Contribution ID is required" },
        { status: 400 }
      );
    }

    // Check if the contribution exists and belongs to the faculty member
    const existingContribution = await query(
      "SELECT F_ID FROM faculty_contributions WHERE Contribution_ID = ?",
      [contribution_id]
    );

    if (
      !existingContribution ||
      !Array.isArray(existingContribution) ||
      existingContribution.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Contribution not found" },
        { status: 404 }
      );
    }

    // For faculty role, ensure they can only update their own contributions
    if (
      authData.user.role === "faculty" &&
      (existingContribution[0] as any).F_ID !== facultyId
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update this contribution" },
        { status: 403 }
      );
    }

    // Update the contribution
    await query(
      `UPDATE faculty_contributions 
       SET Contribution_Type = ?, Description = ?, Contribution_Date = ?
       WHERE Contribution_ID = ?`,
      [contribution_type, description, date, contribution_id]
    );

    return NextResponse.json({
      success: true,
      message: "Contribution updated successfully",
    });
  } catch (error) {
    console.error("Error updating faculty contribution:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update contribution" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Only faculty, HOD, and admin can delete contributions
    if (!["faculty", "hod", "admin"].includes(authData.user.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete contributions" },
        { status: 403 }
      );
    }

    // Get the ID from the query parameters
    let id = request.nextUrl.searchParams.get("id");

    // If not in query params, try to get from request body
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.contribution_id || body.id;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Contribution ID is required" },
        { status: 400 }
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

      // If faculty role, they can only delete their own contributions
      const contributionCheck = (await query(
        "SELECT F_ID FROM faculty_contributions WHERE Contribution_ID = ?",
        [id]
      )) as RowDataPacket[];

      if (
        !contributionCheck ||
        !Array.isArray(contributionCheck) ||
        contributionCheck.length === 0
      ) {
        return NextResponse.json(
          { success: false, message: "Contribution not found" },
          { status: 404 }
        );
      }

      if (contributionCheck[0].F_ID !== facultyId) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized to delete this contribution",
          },
          { status: 403 }
        );
      }
    }

    // Delete the contribution
    await query("DELETE FROM faculty_contributions WHERE Contribution_ID = ?", [
      id,
    ]);

    return NextResponse.json({
      success: true,
      message: "Contribution deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contribution:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete contribution" },
      { status: 500 }
    );
  }
}
