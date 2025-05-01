import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Fetch all departments
    const departments = await query(`
      SELECT Department_ID, Department_Name
      FROM department
      ORDER BY Department_Name
    `);

    return NextResponse.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching departments",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 