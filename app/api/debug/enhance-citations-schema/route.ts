import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

/**
 * This endpoint enhances the faculty_publications table to support multiple citation sources
 * Adds columns for different citation databases (Crossref, Semantic Scholar, Web of Science, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    // Make sure this endpoint is only accessible in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, message: "Not available in production" },
        { status: 403 }
      );
    }

    const results: Record<string, any> = {};

    // Check if faculty_publications table exists
    const tableCheck = await query("SHOW TABLES LIKE 'faculty_publications'");

    if ((tableCheck as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        message: "faculty_publications table does not exist. Create it first.",
      });
    }

    // Check current columns
    const columns = await query("SHOW COLUMNS FROM faculty_publications");
    const columnNames = (columns as any[]).map((col) => col.Field);

    results.existing_columns = columnNames;

    // Add new citation columns if they don't exist
    const citationColumns = [
      "citations_crossref",
      "citations_semantic_scholar",
      "citations_google_scholar",
      "citations_web_of_science",
      "citations_scopus",
      "citations_last_updated",
    ];

    for (const columnName of citationColumns) {
      if (!columnNames.includes(columnName)) {
        try {
          let alterQuery = "";

          if (columnName === "citations_last_updated") {
            alterQuery = `ALTER TABLE faculty_publications ADD COLUMN ${columnName} TIMESTAMP NULL`;
          } else {
            alterQuery = `ALTER TABLE faculty_publications ADD COLUMN ${columnName} INT NULL`;
          }

          await query(alterQuery);
          results[`added_${columnName}`] = "Success";
        } catch (error) {
          results[`error_${columnName}`] =
            error instanceof Error ? error.message : String(error);
        }
      } else {
        results[`${columnName}_status`] = "Already exists";
      }
    }

    // Migrate existing citation_count to citations_crossref where applicable
    try {
      await query(`
        UPDATE faculty_publications 
        SET citations_crossref = citation_count 
        WHERE citation_count IS NOT NULL 
        AND citations_crossref IS NULL
      `);
      results.migration_status =
        "Migrated existing citation_count to citations_crossref";
    } catch (error) {
      results.migration_error =
        error instanceof Error ? error.message : String(error);
    }

    return NextResponse.json({
      success: true,
      message: "Citation schema enhancement completed",
      results,
    });
  } catch (error) {
    console.error("Error enhancing citations schema:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to enhance citations schema",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
