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

    // First check if the faculty ID exists in the faculty table
    const facultyCheck = await query(
      `SELECT F_id, F_name, F_dept 
       FROM faculty 
       WHERE F_id = ?`,
      [facultyUsername]
    );

    // If no direct match in the faculty table, try different approaches
    if (
      !facultyCheck ||
      !Array.isArray(facultyCheck) ||
      facultyCheck.length === 0
    ) {
      console.log(
        `Could not find faculty with ID ${facultyUsername} in faculty table`
      );
      return NextResponse.json(
        { success: false, message: "Faculty record not found" },
        { status: 404 }
      );
    }

    const faculty = facultyCheck[0];

    // Now query for additional details and counts with proper LEFT JOINs
    const detailsQuery = await query(
      `SELECT 
        fd.Email, 
        fd.Phone_Number,
        fd.Current_Designation, 
        fd.Highest_Degree, 
        fd.Experience
      FROM 
        faculty_details fd
      WHERE 
        fd.F_ID = ?`,
      [facultyUsername]
    );

    // Query contributions count separately
    const contribQuery = await query(
      `SELECT 
        COUNT(*) as total_contributions
      FROM 
        faculty_contributions
      WHERE 
        F_ID = ?`,
      [facultyUsername]
    );

    // Query professional memberships count separately
    const membershipQuery = await query(
      `SELECT 
        COUNT(*) as professional_memberships
      FROM 
        faculty_professional_body
      WHERE 
        F_ID = ?`,
      [facultyUsername]
    );

    // Query publications count separately
    const publicationsQuery = await query(
      `SELECT 
        COUNT(*) as publications
      FROM 
        paper_publication
      WHERE 
        id = ?`,
      [facultyUsername]
    );
    // Query awards count separately
const awardsQuery = await query(
  `SELECT COUNT(*) as awards FROM faculty_awards WHERE faculty_id = ?`,
  [facultyUsername]
);


    // Combine all the data
    const facultyData = {
      ...faculty,
      ...(detailsQuery && Array.isArray(detailsQuery) && detailsQuery.length > 0
        ? detailsQuery[0]
        : {
            Email: null,
            Phone_Number: null,
            Current_Designation: null,
            Highest_Degree: null,
            Experience: null,
          }),
      total_contributions:
        contribQuery && Array.isArray(contribQuery) && contribQuery.length > 0
          ? contribQuery[0].total_contributions
          : 0,
      professional_memberships:
        membershipQuery &&
        Array.isArray(membershipQuery) &&
        membershipQuery.length > 0
          ? membershipQuery[0].professional_memberships
          : 0,
      publications:
        publicationsQuery &&
        Array.isArray(publicationsQuery) &&
        publicationsQuery.length > 0
          ? publicationsQuery[0].publications
          : 0,
          awards:
  awardsQuery && Array.isArray(awardsQuery) && awardsQuery.length > 0
    ? awardsQuery[0].awards
    : 0,

    };

    return NextResponse.json({
      success: true,
      data: facultyData,
    });
  } catch (error) {
    console.error("Error fetching faculty data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch faculty information" },
      { status: 500 }
    );
  }
}
