import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

// Define types for the diagnostic results
interface DiagnosticResults {
  success: boolean;
  tablesExist: {
    faculty: boolean;
    faculty_details: boolean;
    faculty_contributions: boolean;
    faculty_professional_body: boolean;
  };
  sampleData: Record<string, any>;
  error: string | null;
}

export async function GET() {
  try {
    const diagnosticResults: DiagnosticResults = {
      success: true,
      tablesExist: {
        faculty: false,
        faculty_details: false,
        faculty_contributions: false,
        faculty_professional_body: false
      },
      sampleData: {},
      error: null
    };

    // 1. Check if the faculty table exists and get its structure
    try {
      const facultyTableCheck = await query(
        "SHOW COLUMNS FROM faculty"
      );
      diagnosticResults.tablesExist.faculty = true;
      diagnosticResults.sampleData['faculty_structure'] = facultyTableCheck;
    } catch (error) {
      console.error("Faculty table error:", error);
      diagnosticResults.error = `Faculty table error: ${error instanceof Error ? error.message : String(error)}`;
    }

    // 2. Check if faculty_details table exists
    try {
      const facultyDetailsCheck = await query(
        "SHOW COLUMNS FROM faculty_details"
      );
      diagnosticResults.tablesExist.faculty_details = true;
      diagnosticResults.sampleData['faculty_details_structure'] = facultyDetailsCheck;
    } catch (error) {
      console.error("Faculty details table error:", error);
      if (!diagnosticResults.error) {
        diagnosticResults.error = `Faculty details table error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    // 3. Check if faculty_contributions table exists
    try {
      const contributionsCheck = await query(
        "SHOW COLUMNS FROM faculty_contributions"
      );
      diagnosticResults.tablesExist.faculty_contributions = true;
      diagnosticResults.sampleData['faculty_contributions_structure'] = contributionsCheck;
    } catch (error) {
      console.error("Faculty contributions table error:", error);
      if (!diagnosticResults.error) {
        diagnosticResults.error = `Faculty contributions table error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    // 4. Check if faculty_professional_body table exists
    try {
      const professionalBodyCheck = await query(
        "SHOW COLUMNS FROM faculty_professional_body"
      );
      diagnosticResults.tablesExist.faculty_professional_body = true;
      diagnosticResults.sampleData['faculty_professional_body_structure'] = professionalBodyCheck;
    } catch (error) {
      console.error("Faculty professional body table error:", error);
      if (!diagnosticResults.error) {
        diagnosticResults.error = `Faculty professional body table error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    // 5. Try a simple query to check data
    try {
      const facultyCount = await query(
        "SELECT COUNT(*) as count FROM faculty"
      );
      diagnosticResults.sampleData['faculty_count'] = facultyCount;
    } catch (error) {
      console.error("Faculty count error:", error);
      if (!diagnosticResults.error) {
        diagnosticResults.error = `Faculty count error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    // 6. Try the actual faculty query but with LIMIT 1 to see what's breaking
    try {
      const facultySampleQuery = await query(`
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
        GROUP BY f.F_id, f.F_name, f.F_dept, fd.Email, fd.Phone_Number, fd.Current_Designation, fd.Highest_Degree, fd.Experience
        LIMIT 1
      `);
      diagnosticResults.sampleData['faculty_sample'] = facultySampleQuery;
    } catch (error) {
      console.error("Faculty sample query error:", error);
      if (!diagnosticResults.error) {
        diagnosticResults.error = `Faculty sample query error: ${error instanceof Error ? error.message : String(error)}`;
      }
    }

    return NextResponse.json(diagnosticResults);
  } catch (error) {
    console.error("Error in faculty check diagnostic:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Diagnostic failed",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 