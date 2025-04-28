import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

// Define types for database table structure
interface TableInfo {
  name: string;
  columns: string[];
  rows: RowDataPacket[];
}

// Custom interfaces for specific query results
interface TableRow extends RowDataPacket {
  table_name: string;
  TABLE_NAME?: string; // Some MySQL versions use this format
}

interface ColumnRow extends RowDataPacket {
  column_name: string;
  COLUMN_NAME?: string; // Some MySQL versions use this format
}

// Type guard for RowDataPacket arrays
function isRowDataPacketArray(result: unknown): result is RowDataPacket[] {
  return Array.isArray(result);
}

export async function GET() {
  try {
    console.log("Database tables API called - fetching table info");

    // Get all table names from the database
    const tableResults = await query(
      "SELECT table_name as table_name FROM information_schema.tables WHERE table_schema = DATABASE()",
      []
    );

    if (!isRowDataPacketArray(tableResults)) {
      console.error(
        "Failed to fetch tables - result is not an array",
        tableResults
      );
      throw new Error("Failed to fetch tables");
    }

    console.log(`Found ${tableResults.length} tables`);

    const tables: TableInfo[] = [];

    // For each table, get its columns and data
    for (const tableRow of tableResults as TableRow[]) {
      // Some MySQL versions use TABLE_NAME instead of table_name
      const tableName = tableRow.table_name || tableRow.TABLE_NAME;
      if (!tableName) {
        console.warn("Found table row with no name", tableRow);
        continue;
      }

      console.log(`Processing table: ${tableName}`);

      // Get column names
      const columnResults = await query(
        "SELECT column_name as column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?",
        [tableName]
      );

      if (!isRowDataPacketArray(columnResults)) {
        console.error(
          `Failed to fetch columns for table ${tableName}`,
          columnResults
        );
        throw new Error(`Failed to fetch columns for table ${tableName}`);
      }

      const columns = (columnResults as ColumnRow[]).map(
        (col) => col.column_name || col.COLUMN_NAME || "unknown"
      );

      console.log(`Found ${columns.length} columns for table ${tableName}`);

      // Get table data (up to 100 rows)
      try {
        const rowResults = await query(
          `SELECT * FROM ${tableName} LIMIT 100`,
          []
        );

        if (!isRowDataPacketArray(rowResults)) {
          console.error(
            `Failed to fetch rows for table ${tableName}`,
            rowResults
          );
          throw new Error(`Failed to fetch rows for table ${tableName}`);
        }

        console.log(`Found ${rowResults.length} rows for table ${tableName}`);

        tables.push({
          name: tableName,
          columns: columns,
          rows: rowResults,
        });
      } catch (error) {
        console.error(`Error fetching data for table ${tableName}:`, error);
        // Continue with other tables instead of failing completely
        tables.push({
          name: tableName,
          columns: columns,
          rows: [],
        });
      }
    }

    console.log(`Returning data for ${tables.length} tables`);
    return NextResponse.json({ success: true, tables });
  } catch (error) {
    console.error("Error fetching database tables:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        message:
          "Make sure your database is properly initialized. Try running 'npm run init-db' to set up the database tables.",
      },
      { status: 500 }
    );
  }
}
