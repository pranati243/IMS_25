// import { NextResponse } from "next/server";
// import { query } from "@/app/lib/db";

// export async function GET() {
//   try {
//     // Get total students and faculty per department
//     const departmentStats = await query(`
//       SELECT
//         d.Department_ID,
//         d.Department_Name,
//         dd.Total_Students,
//         dd.Total_Faculty,
//         COUNT(DISTINCT f.F_id) as current_faculty_count,
//         COUNT(DISTINCT fc.Contribution_ID) as total_contributions,
//         COUNT(DISTINCT fpb.SrNo) as total_professional_memberships
//       FROM department d
//       LEFT JOIN department_details dd ON d.Department_ID = dd.Department_ID
//       LEFT JOIN faculty f ON f.F_dept = d.Department_Name
//       LEFT JOIN faculty_contributions fc ON f.F_id = fc.F_ID
//       LEFT JOIN faculty_professional_body fpb ON f.F_id = fpb.F_ID
//       GROUP BY d.Department_ID, d.Department_Name, dd.Total_Students, dd.Total_Faculty
//       ORDER BY d.Department_ID
//     `);

//     // Get faculty distribution by designation
//     const facultyDistribution = await query(`
//       SELECT
//         f.F_dept as Department_Name,
//         fd.Current_Designation,
//         COUNT(*) as count
//       FROM faculty f
//       JOIN faculty_details fd ON f.F_id = fd.F_ID
//       GROUP BY f.F_dept, fd.Current_Designation
//       ORDER BY f.F_dept, fd.Current_Designation
//     `);

//     // Get recent contributions by department
//     const recentContributions = await query(`
//       SELECT
//         f.F_dept as Department_Name,
//         fc.Contribution_Type,
//         COUNT(*) as count,
//         MAX(fc.Contribution_Date) as latest_date
//       FROM faculty f
//       JOIN faculty_contributions fc ON f.F_id = fc.F_ID
//       WHERE fc.Contribution_Date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
//       GROUP BY f.F_dept, fc.Contribution_Type
//       ORDER BY f.F_dept, latest_date DESC
//     `);

//     return NextResponse.json({
//       success: true,
//       data: {
//         departmentStats,
//         facultyDistribution,
//         recentContributions,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching department statistics:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Error fetching department statistics",
//         error: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// app/api/departments/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const departmentFilter = searchParams.get("department");

    // Get user role from session for additional filtering
    const sessionToken = cookies().get("session_token")?.value;
    let userRole = "guest";

    if (sessionToken) {
      try {
        const decoded = verify(
          sessionToken,
          process.env.JWT_SECRET || "your-secret-key"
        ) as { userId: number; role: string };

        userRole = decoded.role;
      } catch (error) {
        console.error("Token verification failed:", error);
      }
    }

    // Build the SQL query based on role and filters
    let sql = `
      SELECT 
        d.Department_Code, 
        d.Department_Name,
        COUNT(DISTINCT f.F_id) as current_faculty_count,
        COUNT(DISTINCT s.S_id) as Total_Students
      FROM departments d
      LEFT JOIN faculty f ON d.Department_Code = f.F_dept
      LEFT JOIN student s ON d.Department_Code = s.S_dept
    `;

    const params = [];

    // Apply department filter if specified (mainly for HODs)
    if (departmentFilter) {
      sql += " WHERE d.Department_Name = ?";
      params.push(departmentFilter);
    }

    // Group by department
    sql += " GROUP BY d.Department_Code, d.Department_Name";

    // Execute the query
    const departmentStats = await query(sql, params);

    // For students, limit the data they can see
    if (userRole === "student") {
      // Students should only see department names and student counts
      const limitedStats = departmentStats.map((dept: any) => ({
        Department_Code: dept.Department_Code,
        Department_Name: dept.Department_Name,
        current_faculty_count: 0, // Hide actual faculty count
        Total_Students: dept.Total_Students,
      }));

      return NextResponse.json({
        success: true,
        data: { departmentStats: limitedStats },
      });
    }

    return NextResponse.json({
      success: true,
      data: { departmentStats },
    });
  } catch (error) {
    console.error("Error fetching department stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching department statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
