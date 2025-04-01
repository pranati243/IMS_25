import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

interface InsertResult {
  insertId: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const search = searchParams.get("search");

    let sql = `
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
    `;

    const params: (string | number | boolean | null)[] = [];
    const conditions = [];

    if (department) {
      conditions.push("f.F_dept = ?");
      params.push(department);
    }

    if (search) {
      conditions.push("(f.F_name LIKE ? OR fd.Email LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql +=
      " GROUP BY f.F_id, f.F_name, f.F_dept, fd.Email, fd.Phone_Number, fd.Current_Designation, fd.Highest_Degree, fd.Experience";

    const faculty = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching faculty data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      F_name,
      F_dept,
      Email,
      Phone_Number,
      Current_Designation,
      Highest_Degree,
    } = body;

    // Insert into faculty table
    const facultyResult = (await query(
      "INSERT INTO faculty (F_name, F_dept) VALUES (?, ?)",
      [F_name, F_dept]
    )) as InsertResult;

    const F_id = facultyResult.insertId;

    // Insert into faculty_details table
    await query(
      `INSERT INTO faculty_details 
       (F_ID, Email, Phone_Number, Current_Designation, Highest_Degree, Date_of_Joining) 
       VALUES (?, ?, ?, ?, ?, CURDATE())`,
      [F_id, Email, Phone_Number, Current_Designation, Highest_Degree]
    );

    return NextResponse.json({
      success: true,
      message: "Faculty added successfully",
      data: { F_id },
    });
  } catch (error) {
    console.error("Error adding faculty:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error adding faculty",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
