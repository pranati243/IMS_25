import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email parameter is required",
        },
        { status: 400 }
      );
    }

    // Fetch basic faculty details by email
    const facultyQuery = `
      SELECT 
        f.F_id,
        f.F_name,
        f.F_dept,
        fd.Email,
        fd.Phone_Number,
        fd.Current_Designation,
        fd.Highest_Degree,
        fd.Experience,
        COUNT(DISTINCT fc.Contribution_ID) as total_contributions,
        COUNT(DISTINCT fpb.SrNo) as professional_memberships
      FROM faculty f
      LEFT JOIN faculty_details fd ON f.F_id = fd.F_ID
      LEFT JOIN faculty_contributions fc ON f.F_id = fc.F_ID
      LEFT JOIN faculty_professional_body fpb ON f.F_id = fpb.F_ID
      WHERE fd.Email = ?
      GROUP BY f.F_id, f.F_name, f.F_dept, fd.Email, fd.Phone_Number, fd.Current_Designation, fd.Highest_Degree, fd.Experience
    `;

    const facultyData = await query(facultyQuery, [email]);

    if (
      !facultyData ||
      (Array.isArray(facultyData) && facultyData.length === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Faculty not found",
        },
        { status: 404 }
      );
    }

    const faculty = Array.isArray(facultyData) ? facultyData[0] : facultyData;
    const facultyId = faculty.F_id;

    // Fetch publications
    const publicationsQuery = `
      SELECT 
        fc.Contribution_ID as id,
        fc.Title as title,
        fc.Journal_Conference as journal,
        fc.Year as year,
        fc.Author as authors
      FROM faculty_contributions fc
      WHERE fc.F_ID = ? AND fc.Type IN ('journal', 'conference', 'publication')
      ORDER BY fc.Year DESC
    `;

    const publications = await query(publicationsQuery, [facultyId]);

    // Fetch achievements
    const achievementsQuery = `
      SELECT 
        fc.Contribution_ID as id,
        fc.Title as title,
        fc.Description as description,
        fc.Year as date,
        fc.Type as type
      FROM faculty_contributions fc
      WHERE fc.F_ID = ? AND fc.Type IN ('award', 'achievement', 'certification')
      ORDER BY fc.Year DESC
    `;

    const achievements = await query(achievementsQuery, [facultyId]);

    // Fetch research projects count
    const projectsQuery = `
      SELECT COUNT(*) as count
      FROM faculty_contributions
      WHERE F_ID = ? AND Type = 'project'
    `;

    const projectsResult = await query(projectsQuery, [facultyId]);
    const researchProjects = projectsResult[0]?.count || 0;

    // Return complete faculty profile
    return NextResponse.json({
      success: true,
      data: {
        ...faculty,
        publications: publications || [],
        achievements: achievements || [],
        researchProjects,
        professionalMemberships: faculty.professional_memberships || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching faculty details by email:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching faculty details",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
