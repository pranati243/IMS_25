import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { query } from "@/app/lib/db";
import { OkPacket, ResultSetHeader } from "mysql2";

export async function POST(request: NextRequest) {
  try {
    const { name, email, username, password, role, departmentId, facultyId, studentId } = await request.json();

    // Validate input
    if (!name || !email || !username || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate role - prevent admin/hod registration by regular users
    if (role === "admin" || role === "hod") {
      return NextResponse.json(
        { success: false, message: "You don't have permission to create this role" },
        { status: 403 }
      );
    }

    // For faculty, verify that faculty ID exists in the faculty table
    if (role === "faculty") {
      if (!facultyId) {
        return NextResponse.json(
          { success: false, message: "Faculty ID is required" },
          { status: 400 }
        );
      }

      // Check if faculty ID exists in faculty table
      const faculty = await query(
        `
        SELECT F_id FROM faculty 
        WHERE F_id = ?
        LIMIT 1
        `,
        [facultyId]
      );

      // Check if faculty exists (faculty will be an array)
      if (!faculty || (Array.isArray(faculty) && faculty.length === 0)) {
        return NextResponse.json(
          { success: false, message: "Faculty ID not found in the system. Contact administrator." },
          { status: 404 }
        );
      }
    }

    // Check if email or username already exists
    const existingUsers = await query(
      `
      SELECT id FROM users 
      WHERE email = ? OR username = ?
      LIMIT 1
      `,
      [email, username]
    );

    // existingUsers will be an array
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: "Username or email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Set the appropriate ID field based on role
    const facultyIdValue = role === "faculty" ? facultyId : null;
    const studentIdValue = role === "student" ? studentId : null;

    // Insert new user
    const result = await query(
      `
      INSERT INTO users (
        username, password, email, name, role, department_id, faculty_id, student_id, created_at, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1)
      `,
      [username, hashedPassword, email, name, role, departmentId, facultyIdValue, studentIdValue]
    ) as OkPacket;

    // Get user ID from insert result
    const userId = result.insertId;

    // Assign default permissions based on role
    await assignDefaultPermissions(userId, role);

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    );
  }
}

async function assignDefaultPermissions(userId: number, role: string) {
  // This function would normally assign permissions from role_permissions table
  // But since we're using the role enum directly, this is just a placeholder
  // The permissions are assigned through the role field in the users table
  return;
} 