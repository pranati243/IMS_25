// app/api/faculty/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

interface CountResult extends RowDataPacket {
  total_contributions?: number;
  professional_memberships?: number;
  publications?: number;
  awards?: number;
  research_projects?: number;
  workshops_attended?: number;
  workshop_contributions?: number;
}

interface FacultyDetails extends RowDataPacket {
  Email?: string | null;
  Phone_Number?: string | null;
  Current_Designation?: string | null;
  Highest_Degree?: string | null;
  Experience?: number | null;
}

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
    let detailsQuery: FacultyDetails[] = [];
    try {
      detailsQuery = await query(
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
      ) as FacultyDetails[];
    } catch (error) {
      console.error("Error fetching faculty details:", error);
    }

    // Query contributions count separately
    let contribQuery: CountResult[] = [];
    try {
      contribQuery = await query(
        `SELECT 
          COUNT(*) as total_contributions
        FROM 
          faculty_contributions
        WHERE 
          F_ID = ?`,
        [facultyUsername]
      ) as CountResult[];
    } catch (error) {
      console.error("Error fetching contributions count:", error);
    }

    // Query professional memberships count separately
    let membershipQuery: CountResult[] = [];
    try {
      membershipQuery = await query(
        `SELECT 
          COUNT(*) as professional_memberships
        FROM 
          faculty_memberships
        WHERE 
          faculty_id = ?`,
        [facultyUsername]
      ) as CountResult[];
    } catch (error) {
      console.error("Error fetching memberships count:", error);
    }

    // Query publications count separately
    let publicationsQuery: CountResult[] = [];
    try {
      publicationsQuery = await query(
        `SELECT 
          COUNT(*) as publications
        FROM 
          paper_publication
        WHERE 
          id = ?`,
        [facultyUsername]
      ) as CountResult[];
    } catch (error) {
      console.error("Error fetching publications count:", error);
    }
    
    // Query awards count separately
    let awardsQuery: CountResult[] = [];
    try {
      awardsQuery = await query(
        `SELECT COUNT(*) as awards FROM faculty_awards WHERE faculty_id = ?`,
        [facultyUsername]
      ) as CountResult[];
    } catch (error) {
      console.error("Error fetching awards count:", error);
    }

    // Query research projects count separately
    let researchProjectsQuery: CountResult[] = [];
    try {
      researchProjectsQuery = await query(
        `SELECT 
          COUNT(*) as research_projects
        FROM 
          research_project_consultancies
        WHERE 
          user_id = ?`,
        [facultyUsername]
      ) as CountResult[];
    } catch (error) {
      console.error("Error fetching research projects count:", error);
    }

    // Query workshops count separately - using the correct faculty_workshops table
    let workshopsQuery: CountResult[] = [];
    try {
      workshopsQuery = await query(
        `SELECT 
          COUNT(*) as workshops_attended
        FROM 
          faculty_workshops
        WHERE 
          faculty_id = ?`,
        [facultyUsername]
      ) as CountResult[];
    } catch (error) {
      console.error("Error fetching workshops count:", error);
    }

    // Also check for workshop-like entries in contributions table
    let workshopContributionsQuery: CountResult[] = [];
    try {
      workshopContributionsQuery = await query(
        `SELECT 
          COUNT(*) as workshop_contributions
        FROM 
          faculty_contributions
        WHERE 
          F_ID = ? AND 
          (
            Contribution_Type LIKE '%workshop%' OR 
            Contribution_Type LIKE '%seminar%' OR 
            Contribution_Type LIKE '%conference%' OR
            Contribution_Type LIKE '%training%'
          )`,
        [facultyUsername]
      ) as CountResult[];
    } catch (error) {
      console.error("Error fetching workshop contributions count:", error);
    }

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
          ? contribQuery[0].total_contributions || 0
          : 0,
      professional_memberships:
        membershipQuery &&
        Array.isArray(membershipQuery) &&
        membershipQuery.length > 0
          ? membershipQuery[0].professional_memberships || 0
          : 0,
      publications:
        publicationsQuery &&
        Array.isArray(publicationsQuery) &&
        publicationsQuery.length > 0
          ? publicationsQuery[0].publications || 0
          : 0,
      awards:
        awardsQuery && Array.isArray(awardsQuery) && awardsQuery.length > 0
          ? awardsQuery[0].awards || 0
          : 0,
      research_projects:
        researchProjectsQuery && 
        Array.isArray(researchProjectsQuery) && 
        researchProjectsQuery.length > 0
          ? researchProjectsQuery[0].research_projects || 0
          : 0,
      workshops_attended:
        (workshopsQuery && 
        Array.isArray(workshopsQuery) && 
        workshopsQuery.length > 0
          ? workshopsQuery[0].workshops_attended || 0
          : 0) +
        (workshopContributionsQuery && 
        Array.isArray(workshopContributionsQuery) && 
        workshopContributionsQuery.length > 0
          ? workshopContributionsQuery[0].workshop_contributions || 0
          : 0)
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
