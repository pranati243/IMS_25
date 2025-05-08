import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Check if table already exists
    const tableCheck = await query("SHOW TABLES LIKE 'faculty_publications'");

    if ((tableCheck as any[]).length > 0) {
      return NextResponse.json({
        success: true,
        message: "Table faculty_publications already exists",
      });
    }

    // Create the faculty_publications table with the proper schema
    await query(`
      CREATE TABLE faculty_publications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_id VARCHAR(50) NOT NULL,
        title VARCHAR(500) NOT NULL,
        abstract TEXT,
        authors VARCHAR(500) NOT NULL,
        publication_date DATE NOT NULL,
        publication_type ENUM('journal', 'conference', 'book', 'book_chapter', 'other') NOT NULL,
        publication_venue VARCHAR(500) NOT NULL,
        doi VARCHAR(100),
        url VARCHAR(1000),
        citation_count INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (faculty_id) REFERENCES faculty(F_id)
      )
    `);

    return NextResponse.json({
      success: true,
      message: "Faculty publications table created successfully",
    });
  } catch (error) {
    console.error("Error creating faculty_publications table:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create faculty publications table",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
