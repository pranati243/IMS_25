import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get("facultyId");
    const type = searchParams.get("type");

    let sql = `
      SELECT 
        fc.*,
        f.F_name,
        f.F_dept
      FROM faculty_contributions fc
      JOIN faculty f ON fc.F_ID = f.F_id
    `;

    const params: (string | number | boolean | null)[] = [];
    const conditions = [];

    if (facultyId) {
      conditions.push("fc.F_ID = ?");
      params.push(facultyId);
    }

    if (type) {
      conditions.push("fc.Contribution_Type = ?");
      params.push(type);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY fc.Contribution_Date DESC";

    const contributions = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: contributions,
    });
  } catch (error) {
    console.error("Error fetching faculty contributions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching faculty contributions",
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
      F_ID,
      Contribution_Type,
      Description,
      Contribution_Date,
      Recognized_By,
      Award_Received,
      Remarks,
    } = body;

    const result = await query(
      `INSERT INTO faculty_contributions 
       (F_ID, Contribution_Type, Description, Contribution_Date, Recognized_By, Award_Received, Remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        F_ID,
        Contribution_Type,
        Description,
        Contribution_Date,
        Recognized_By,
        Award_Received,
        Remarks,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Contribution added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error adding faculty contribution:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error adding faculty contribution",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
