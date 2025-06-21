import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

// Helper function to calculate duration between two dates in years
function calculateDuration(startDate: string, endDate: string): string {
  try {
    // Parse dates properly, accounting for different possible formats
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn("Invalid date format:", { startDate, endDate });
      return "1"; // Default if dates are invalid
    } // Calculate difference in milliseconds
    const diffTime = Math.abs(end.getTime() - start.getTime());

    // Convert to days and then to years (accounting for leap years)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = (diffDays / 365.25).toFixed(1); // Using 365.25 to account for leap years

    // Parse to float and ensure minimum of 0.1 years (about a month)
    const years = Math.max(0.1, parseFloat(diffYears));

    // Convert to string with 1 decimal place for MySQL's INTERVAL syntax
    return years.toFixed(1);
  } catch (error) {
    console.error("Error calculating duration:", error);
    return "1"; // Default to 1 year if calculation fails
  }
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

      facultyId = (facultyResult[0] as RowDataPacket).F_id;
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

    // Check if table exists and fetch research projects
    try {
      // Query from the existing research_project_consultancies table
      const projects = (await query(
        `SELECT 
          id,
          Name_Of_Principal_Investigator_CoInvestigator AS faculty_name,
          Name_Of_Project_Endownment AS title,
          Type_Research_Project_Consultancy AS description,
          Year_Of_Award AS start_date,
          CASE 
            WHEN STATUS = 'ongoing' OR Duration_Of_The_Project = '' THEN NULL
            WHEN Duration_Of_The_Project REGEXP '^[0-9.]+$' THEN DATE_ADD(STR_TO_DATE(Year_Of_Award, '%Y-%m-%d'), INTERVAL CAST(Duration_Of_The_Project AS DECIMAL(10,1)) YEAR)
            ELSE NULL 
          END AS end_date,
          STATUS AS status,
          Name_Of_The_Funding_Agency AS funding_agency,
          Amount_Sanctioned AS funding_amount,
          Department_Of_Principal_Investigator AS department,
          Type_Govt_NonGovt AS funding_type,
          Academic_year,
          Duration_Of_The_Project AS duration
        FROM 
          research_project_consultancies
        WHERE 
          user_id = ?
        ORDER BY 
          Year_Of_Award DESC`,
        [queryFacultyId]
      )) as RowDataPacket[];

      console.log(
        `Found ${projects.length} research projects for faculty ID ${queryFacultyId}`
      );

      // Return the research projects data
      return NextResponse.json({
        success: true,
        data: projects,
      });
    } catch (error) {
      console.error(
        "Error checking/querying faculty_research_projects table:",
        error
      );
      return NextResponse.json({
        success: true,
        data: [],
        error: "Database error when fetching research projects",
      });
    }
  } catch (error) {
    console.error("Error fetching faculty research projects:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch research projects" },
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

    // Only faculty or admin can add research projects
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
        facultyId = (facultyResult[0] as RowDataPacket).F_id;
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
      description,
      startDate,
      endDate,
      status = "Ongoing",
      fundingAgency,
      fundingAmount,
    } = body;

    // Validate required fields
    if (!title || !startDate) {
      return NextResponse.json(
        { success: false, message: "Title and start date are required" },
        { status: 400 }
      );
    }

    // Insert into the existing research_project_consultancies table
    try {
      // Check if faculty exists
      const facultyDetails = (await query(
        `SELECT F_name, F_dept FROM faculty WHERE F_id = ?`,
        [facultyId]
      )) as RowDataPacket[];

      if (
        !facultyDetails ||
        !Array.isArray(facultyDetails) ||
        facultyDetails.length === 0
      ) {
        return NextResponse.json(
          { success: false, message: "Faculty not found" },
          { status: 404 }
        );
      }

      const faculty = facultyDetails[0] as RowDataPacket;
      const currentAcademicYear = new Date().getFullYear();
      const academicYear = `${currentAcademicYear}-${currentAcademicYear + 1}`;

      // Determine duration based on status and end date
      let duration = "1"; // Default

      if (status === "ongoing" && !endDate) {
        // For ongoing projects with no end date, set duration to empty/null
        duration = "";
      } else if ((status === "completed" || status === "planned") && endDate) {
        // Calculate duration only for completed/planned projects with an end date
        duration = calculateDuration(startDate, endDate);
      }

      // Insert the research project into the existing table
      const result = (await query(
        `INSERT INTO research_project_consultancies 
          (Academic_year, Type_Research_Project_Consultancy, Branch, 
           Name_Of_Project_Endownment, Name_Of_Principal_Investigator_CoInvestigator, 
           Department_Of_Principal_Investigator, Year_Of_Award, Amount_Sanctioned, 
           Duration_Of_The_Project, Name_Of_The_Funding_Agency, 
           Funding_Agency_Website_Link, Type_Govt_NonGovt, pdffile1, user_id, STATUS, Source) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          academicYear,
          description || "Research Project", // Use the actual description provided by the user
          faculty.F_dept || "N/A",
          title,
          faculty.F_name,
          faculty.F_dept || "N/A",
          startDate,
          fundingAmount || "0",
          duration, // Store calculated duration or empty string for ongoing projects
          fundingAgency || "N/A",
          "", // Website link not provided
          fundingAgency ? "Government" : "N/A", // Default to Government if funding agency provided
          "", // No PDF file
          facultyId,
          status || "approved",
          "Faculty Portal",
        ]
      )) as any; // Type assertion to any to handle insertId

      // Return success response
      return NextResponse.json({
        success: true,
        message: "Research project added successfully",
        data: {
          id: result.insertId,
          faculty_id: facultyId,
          faculty_name: faculty.F_name,
          title,
          description,
          department: faculty.F_dept,
          academic_year: academicYear,
          start_date: startDate,
          end_date: endDate,
          status,
          funding_agency: fundingAgency,
          funding_amount: fundingAmount,
          funding_type: fundingAgency ? "Government" : "N/A",
        },
      });
    } catch (error) {
      console.error("Error adding research project:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to add research project",
          error: String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in research projects API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Note: PUT and DELETE handlers have been moved to [id]/route.ts to properly handle dynamic routes
