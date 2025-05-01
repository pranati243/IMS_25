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
import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET() {
  try {
    // First check if tables exist
    const departmentTableExists = await query("SHOW TABLES LIKE 'department'");
    const facultyTableExists = await query("SHOW TABLES LIKE 'faculty'");
    
    if (!(departmentTableExists as any[]).length) {
      throw new Error("Department table does not exist");
    }
    
    // Get list of all departments
    const departments = await query(
      `SELECT Department_ID, Department_Name FROM department ORDER BY Department_Name`
    );
    
    const stats = [];
    
    for (const dept of departments as any[]) {
      const deptName = dept.Department_Name;
      
      // Query to count faculty in this department
      let facultyCount = 0;
      if ((facultyTableExists as any[]).length) {
        const facultyResult = await query(
          `SELECT COUNT(*) as count FROM faculty WHERE F_dept = ?`,
          [deptName]
        );
        facultyCount = (facultyResult as any[])[0].count;
      }
      
      // Get department details if available
      let details = {};
      try {
        const detailsQuery = await query(
          `SELECT * FROM department_details WHERE Department_ID = ?`,
          [dept.Department_ID]
        );
        
        if ((detailsQuery as any[]).length) {
          details = (detailsQuery as any[])[0];
        }
      } catch (error) {
        console.error(`Error getting details for department ${deptName}:`, error);
      }
      
      // Get HOD name if available
      let hodName = "Not assigned";
      let hodId = null;
      try {
        if (details && (details as any).HOD_ID) {
          hodId = (details as any).HOD_ID;
          const hodQuery = await query(
            `SELECT F_name FROM faculty WHERE F_id = ?`,
            [hodId]
          );
          
          if ((hodQuery as any[]).length) {
            hodName = (hodQuery as any[])[0].F_name;
          }
        }
      } catch (error) {
        console.error(`Error getting HOD for department ${deptName}:`, error);
      }
      
      stats.push({
        id: dept.Department_ID,
        name: deptName,
        facultyCount,
        studentsCount: (details as any)?.Total_Students || 0,
        hodName,
        hodId,
        establishmentYear: (details as any)?.Establishment_Year || null,
      });
    }
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error getting department stats:", error);
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
