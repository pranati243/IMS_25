import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: publicationId } = await params;

    // Get co-authors for the publication
    const coAuthorsResult = (await query(
      `SELECT pca.faculty_id, f.F_name, f.F_dept
       FROM publication_co_authors pca
       JOIN faculty f ON pca.faculty_id = f.F_id
       WHERE pca.publication_id = ?
       ORDER BY pca.author_order`,
      [publicationId]
    )) as RowDataPacket[];

    const coAuthors = coAuthorsResult.map((row) => ({
      id: row.faculty_id,
      name: row.F_name,
      department: row.F_dept,
    }));

    return NextResponse.json({
      success: true,
      data: coAuthors,
    });
  } catch (error) {
    console.error("Error fetching co-authors:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch co-authors",
      },
      { status: 500 }
    );
  }
}
