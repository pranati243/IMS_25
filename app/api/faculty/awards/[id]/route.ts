import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: award_id } = context.params;

    const body = await request.json();
    console.log("Received data for update:", body);

    // Destructure with default null values
    const {
      award_name,
      awarding_organization,
      award_description,
      award_date,
      category
    } = body;

    console.log("Final values:", { award_name, awarding_organization, award_description, award_date, category });

    await query(
      `
      UPDATE faculty_awards
      SET 
        award_name = ?, 
        awarding_organization = ?, 
        award_description = ?, 
        award_date = ?,
        category = ?
      WHERE award_id = ?
    `,
      [award_name, awarding_organization, award_description, award_date, category, award_id]
    );

    return NextResponse.json({
      success: true,
      message: "Award updated successfully",
    });

  } catch (error) {
    console.error("Error updating faculty_awards:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating faculty_awards",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    await query(`DELETE FROM faculty_awards WHERE award_id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: "Award deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete award" },
      { status: 500 }
    );
  }
}

