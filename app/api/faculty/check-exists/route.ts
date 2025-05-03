import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get faculty ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const facultyId = searchParams.get("id");

    if (!facultyId) {
      return NextResponse.json(
        { success: false, message: "Faculty ID is required" },
        { status: 400 }
      );
    }

    // Check if the faculty ID exists in the faculty table
    const faculty = await query(
      `
      SELECT F_id
      FROM faculty
      WHERE F_id = ?
      LIMIT 1
      `,
      [facultyId]
    );

    // Check if the faculty ID is already registered in users table
    const existingUser = await query(
      `
      SELECT id
      FROM users
      WHERE faculty_id = ? OR username = ?
      LIMIT 1
      `,
      [facultyId, facultyId]
    );

    // Return result
    if (existingUser && Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: "Faculty ID already registered"
      });
    }

    return NextResponse.json({
      success: true,
      exists: faculty && Array.isArray(faculty) && faculty.length > 0,
      message: faculty && Array.isArray(faculty) && faculty.length > 0 
        ? "Faculty ID exists" 
        : "Faculty ID not found"
    });
  } catch (error) {
    console.error("Error checking faculty:", error);
    return NextResponse.json(
      { success: false, message: "Error checking faculty" },
      { status: 500 }
    );
  }
} 