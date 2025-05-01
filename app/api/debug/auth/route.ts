import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const dbTest = await query("SELECT 1 as connection_test");
    
    // Return debug information
    return NextResponse.json({
      success: true,
      message: "API and database connection test successful",
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        dbConnected: !!dbTest
      }
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Debug API error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 