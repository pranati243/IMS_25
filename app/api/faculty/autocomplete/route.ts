import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("q") || "";

    // Get faculty list for autocomplete
    const facultyResult = (await query(
      `SELECT F_id, F_name, F_dept 
       FROM faculty 
       WHERE F_name LIKE ? OR F_id LIKE ?
       ORDER BY F_name
       LIMIT 20`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    )) as RowDataPacket[];

    const facultyList = facultyResult.map((faculty) => ({
      id: faculty.F_id,
      name: faculty.F_name,
      department: faculty.F_dept,
    }));

    return NextResponse.json({
      success: true,
      data: facultyList,
    });
  } catch (error) {
    console.error("Error fetching faculty autocomplete:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch faculty list",
      },
      { status: 500 }
    );
  }
}
