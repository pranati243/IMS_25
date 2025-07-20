import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

interface FacultyRow extends RowDataPacket {
  F_id: string;
}

interface MembershipRow extends RowDataPacket {
  F_ID: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: membershipId } = await params;
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

    // Only faculty, HOD, and admin can update memberships
    if (!["faculty", "hod", "admin"].includes(authData.user.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update memberships" },
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

    // membershipId already declared at top of function

    // Parse request body
    const {
      organization,
      Membership_Type,
      Start_Date,
      End_Date,
      description = "Faculty membership",
    } = await request.json();

    // Validate required fields
    if (!organization || !Membership_Type || !Start_Date) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Organization name, membership type, and start date are required",
        },
        { status: 400 }
      );
    }

    // Check if the membership exists and belongs to the user
    const checkResult = await query(
      "SELECT faculty_id FROM faculty_memberships WHERE membership_id = ?",
      [membershipId]
    );

    if (
      !checkResult ||
      !Array.isArray(checkResult) ||
      checkResult.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Membership not found" },
        { status: 404 }
      );
    }

    // For faculty members, ensure they can only update their own memberships
    if (
      authData.user.role === "faculty" &&
      (checkResult[0] as any).faculty_id !== facultyId
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update this membership" },
        { status: 403 }
      );
    }

    // Update the membership
    await query(
      `UPDATE faculty_memberships 
       SET organization = ?, 
           membership_type = ?, 
           start_date = ?, 
           end_date = ?,
           description = ?
       WHERE membership_id = ?`,
      [
        organization,
        Membership_Type,
        Start_Date,
        End_Date || null,
        description,
        membershipId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Membership updated successfully",
    });
  } catch (error) {
    console.error("Error updating membership:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update membership" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deleteId } = await params;
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

    // Only faculty, HOD, and admin can delete memberships
    if (!["faculty", "hod", "admin"].includes(authData.user.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete memberships" },
        { status: 403 }
      );
    }

    // membershipId already declared as deleteId at top of function

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

    // Check if the membership exists and belongs to the user
    const checkResult = await query(
      "SELECT faculty_id FROM faculty_memberships WHERE membership_id = ?",
      [deleteId]
    );

    if (
      !checkResult ||
      !Array.isArray(checkResult) ||
      checkResult.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Membership not found" },
        { status: 404 }
      );
    }

    // For faculty members, ensure they can only delete their own memberships
    if (
      authData.user.role === "faculty" &&
      (checkResult[0] as any).faculty_id !== facultyId
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete this membership" },
        { status: 403 }
      );
    }

    // Delete the membership
    await query("DELETE FROM faculty_memberships WHERE membership_id = ?", [
      deleteId,
    ]);

    return NextResponse.json({
      success: true,
      message: "Membership deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting membership:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete membership" },
      { status: 500 }
    );
  }
}
