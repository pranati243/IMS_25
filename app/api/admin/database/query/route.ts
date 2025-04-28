import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query: sqlQuery } = body;

    console.log("Database query API called with query:", sqlQuery);

    if (!sqlQuery || typeof sqlQuery !== "string") {
      console.log("Invalid query format");
      return NextResponse.json(
        {
          success: false,
          message: "SQL query is required",
        },
        { status: 400 }
      );
    }

    // Block potentially dangerous operations for safety
    const blockedKeywords = [
      "DROP",
      "DELETE",
      "TRUNCATE",
      "UPDATE",
      "ALTER",
      "CREATE",
      "INSERT",
      "GRANT",
      "REVOKE",
    ];

    const isBlockedOperation = blockedKeywords.some((keyword) =>
      sqlQuery.toUpperCase().includes(keyword)
    );

    if (isBlockedOperation) {
      console.log("Blocked operation detected in query");
      return NextResponse.json(
        {
          success: false,
          message:
            "For safety, this demo only allows SELECT operations. Modify, delete, and structure operations are disabled.",
        },
        { status: 403 }
      );
    }

    console.log("Executing query:", sqlQuery);

    // Execute the query
    const result = await query(sqlQuery);

    console.log(
      `Query returned ${Array.isArray(result) ? result.length : 0} results`
    );

    return NextResponse.json({
      success: true,
      results: Array.isArray(result) ? result : [],
    });
  } catch (error) {
    console.error("Error executing custom query:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Query execution failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
