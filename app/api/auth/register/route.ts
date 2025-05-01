import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { query } from "@/app/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { name, email, username, password, role, departmentId } = await request.json();

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

    // Check if email or username already exists
    const existingUsers = await query(
      `
      SELECT id FROM users 
      WHERE email = ? OR username = ?
      LIMIT 1
      `,
      [email, username]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: "Username or email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Insert new user
    const result = await query(
      `
      INSERT INTO users (
        username, password, email, name, role, department_id, created_at, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), 1)
      `,
      [username, hashedPassword, email, name, role, departmentId]
    );

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