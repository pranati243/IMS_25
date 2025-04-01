// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcrypt";
import { query } from "@/app/lib/db";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get user from database
    const users = await query(
      `
      SELECT 
        u.id, u.username, u.email, u.password, u.role, u.name
      FROM users u
      WHERE u.email = ? AND u.is_active = 1
      LIMIT 1
      `,
      [email]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check password
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Get user permissions from role_permissions table
    const permissions = await query(
      `
      SELECT p.name
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role = ?
      `,
      [user.role]
    );

    const permissionNames = permissions.map((p: any) => p.name);

    // Create session token
    const sessionToken = sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    // Set cookie
    cookies().set({
      name: "session_token",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        permissions: permissionNames,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500 }
    );
  }
}
