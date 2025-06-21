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

// Handle update (PUT) requests for research projects
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID" },
        { status: 400 }
      );
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

    // Only faculty, HOD, and admin can update research projects
    if (
      authData.user.role !== "faculty" &&
      authData.user.role !== "admin" &&
      authData.user.role !== "hod"
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update research projects" },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const {
      title,
      description,
      start_date, // Note: Frontend uses snake_case
      end_date,
      status,
      funding_agency,
      funding_amount,
    } = body;

    // Validate required fields
    if (!title || !start_date || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Title, start date, and status are required",
        },
        { status: 400 }
      );
    }

    // If user is faculty, verify they can only update their own projects
    if (authData.user.role === "faculty") {
      const projectResult = (await query(
        "SELECT user_id FROM research_project_consultancies WHERE id = ?",
        [id]
      )) as RowDataPacket[];

      if (projectResult.length === 0) {
        return NextResponse.json(
          { success: false, message: "Research project not found" },
          { status: 404 }
        );
      }

      const facultyResult = (await query(
        "SELECT F_id FROM faculty WHERE F_id = ?",
        [authData.user.username]
      )) as RowDataPacket[];

      if (
        facultyResult.length === 0 ||
        projectResult[0].user_id !== facultyResult[0].F_id
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized to update this research project",
          },
          { status: 403 }
        );
      }
    }

    // Get the faculty details for updating the project
    const facultyId =
      authData.user.role === "faculty" ? authData.user.username : null;
    let faculty;

    if (facultyId) {
      const facultyDetails = (await query(
        `SELECT F_name, F_dept FROM faculty WHERE F_id = ?`,
        [facultyId]
      )) as RowDataPacket[];

      if (facultyDetails.length > 0) {
        faculty = facultyDetails[0];
      }
    } // Determine duration based on status and end date
    let duration = "1"; // Default

    if (status === "ongoing" && !end_date) {
      // For ongoing projects with no end date, set duration to empty/null
      duration = "";
    } else if ((status === "completed" || status === "planned") && end_date) {
      // Calculate duration only for completed/planned projects with an end date
      duration = calculateDuration(start_date, end_date);
    } // Update the research project
    await query(
      `UPDATE research_project_consultancies 
       SET Name_Of_Project_Endownment = ?, 
           Type_Research_Project_Consultancy = ?, 
           Year_Of_Award = ?,
           Duration_Of_The_Project = ?,
           STATUS = ?,
           Name_Of_The_Funding_Agency = ?,
           Amount_Sanctioned = ?
       WHERE id = ?`,
      [
        title,
        description || "Research Project", // Use exact description provided by user
        start_date,
        duration, // Use calculated duration based on status and end date
        status || "approved",
        funding_agency || "N/A",
        funding_amount || "0",
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Research project updated successfully",
    });
  } catch (error) {
    console.error("Error updating research project:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update research project" },
      { status: 500 }
    );
  }
}

// Handle delete (DELETE) requests for research projects
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID" },
        { status: 400 }
      );
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

    // Only faculty, HOD, and admin can delete research projects
    if (
      authData.user.role !== "faculty" &&
      authData.user.role !== "admin" &&
      authData.user.role !== "hod"
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete research projects" },
        { status: 403 }
      );
    }

    // If user is faculty, verify they can only delete their own projects
    if (authData.user.role === "faculty") {
      const projectResult = (await query(
        "SELECT user_id FROM research_project_consultancies WHERE id = ?",
        [id]
      )) as RowDataPacket[];

      if (projectResult.length === 0) {
        return NextResponse.json(
          { success: false, message: "Research project not found" },
          { status: 404 }
        );
      }

      const facultyResult = (await query(
        "SELECT F_id FROM faculty WHERE F_id = ?",
        [authData.user.username]
      )) as RowDataPacket[];

      if (
        facultyResult.length === 0 ||
        projectResult[0].user_id !== facultyResult[0].F_id
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized to delete this research project",
          },
          { status: 403 }
        );
      }
    }

    // Delete the research project
    await query("DELETE FROM research_project_consultancies WHERE id = ?", [
      id,
    ]);

    return NextResponse.json({
      success: true,
      message: "Research project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting research project:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete research project" },
      { status: 500 }
    );
  }
}
