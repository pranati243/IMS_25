import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workshopId } = await params;

  try {
    const body = await request.json();
    const { title, description, start_date, end_date, venue, type, role } =
      body;

    // Update query
    await query(
      `UPDATE faculty_workshops SET 
        title = ?, 
        description = ?, 
        start_date = ?, 
        end_date = ?, 
        venue = ?, 
        type = ?, 
        role = ?
      WHERE id = ?`,
      [title, description, start_date, end_date, venue, type, role, workshopId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating workshop:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update workshop" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workshopId } = await params;

  try {
    await query("DELETE FROM faculty_workshops WHERE id = ?", [workshopId]);

    return NextResponse.json({
      success: true,
      message: "Workshop deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting workshop:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete workshop" },
      { status: 500 }
    );
  }
}
