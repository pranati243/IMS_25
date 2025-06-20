import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { sign } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// This route should ONLY be available in development mode
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, message: "Debug routes are disabled in production" },
      { status: 403 }
    );
  }

  try {
    // Get admin user for quick access
    const users = await query(
      `SELECT id, username, email, role, name, department_id
       FROM users 
       WHERE role = 'admin' 
       LIMIT 1`
    );

    if (!users || (users as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "No admin user found" },
        { status: 404 }
      );
    }

    const user = (users as any[])[0];

    // Get permissions
    const permissions = await query(
      `SELECT p.name
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role = ?`,
      [user.role]
    );

    const permissionNames = (permissions as any[]).map((p) => p.name);

    // Create a new session token
    const sessionToken = sign(
      { userId: user.id, role: user.role, debug: true },
      JWT_SECRET!,
      { expiresIn: "24h" }
    );

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: "Authentication bypassed for development",
      user: {
        ...user,
        permissions: permissionNames,
      },
    });

    // Set cookies
    response.cookies.set({
      name: "session_token",
      value: sessionToken,
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax",
    });

    response.cookies.set({
      name: "auth_status",
      value: "debug_login",
      httpOnly: false,
      secure: false,
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax",
    });

    // Add this route to middleware's public paths
    console.log("Auth bypass successful - redirecting to dashboard");

    return response;
  } catch (error) {
    console.error("Bypass auth error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Authentication bypass failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
