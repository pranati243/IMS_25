// app/api/faculty/me/route.ts
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

    // Check if user is faculty role
    if (authData.user.role !== "faculty") {
      return NextResponse.json(
        { success: false, message: "User is not a faculty member" },
        { status: 403 }
      );
    }

    // Get faculty ID from username
    const facultyUsername = authData.user.username;

    // Fetch faculty information from database
    const facultyResults = await query(
      `SELECT 
        f.F_id, 
        n.F_name, 
        n.F_dept, 
        f.Email, 
        f.Phone_Number,
        f.Current_Designation, 
        f.Highest_Degree, 
        f.Experience,
        COUNT(DISTINCT c.contribution_id) as total_contributions,
        COUNT(DISTINCT m.SrNo) as professional_memberships
      FROM 
        faculty_details f
      LEFT JOIN
        faculty n ON f.F_id = n.F_id
      LEFT JOIN 
        faculty_contributions c ON f.F_id = c.f_id
      LEFT JOIN 
        faculty_professional_body m ON f.F_id = m.f_id
      WHERE 
        f.F_ID = ?
      GROUP BY 
        f.F_id, n.F_name, n.F_dept, f.Email, f.Phone_Number, f.Current_Designation, f.Highest_Degree, f.Experience`,
      [facultyUsername]
    );

    if (
      !facultyResults ||
      !Array.isArray(facultyResults) ||
      facultyResults.length === 0
    ) {
      return NextResponse.json(
        { success: false, message: "Faculty information not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: facultyResults[0],
    });
  } catch (error) {
    console.error("Error fetching faculty data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch faculty information" },
      { status: 500 }
    );
  }
}
