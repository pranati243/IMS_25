import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import * as jose from "jose"; // Using jose instead of jsonwebtoken for compatibility with middleware

export async function POST(request: NextRequest) {
  try {
    // Only allow this in development mode
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, message: "Direct login not available in production" },
        { status: 403 }
      );
    }

    // Force content type to be application/json
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    // Get credentials from request
    const { email, bypass } = await request.json();

    if (!email || bypass !== "debug-mode-bypass") {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      );
    }

    // Find user directly
    const users = await query(
      `SELECT 
        id, username, email, role, name, department_id
      FROM users 
      WHERE email = ? AND is_active = 1
      LIMIT 1`,
      [email]
    );

    if (!users || (users as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
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
    // Create session token using jose instead of jsonwebtoken
    const JWT_SECRET = process.env.JWT_SECRET;

    // Create a TextEncoder
    const encoder = new TextEncoder();

    // Convert JWT_SECRET to Uint8Array for jose
    const secretKey = encoder.encode(JWT_SECRET);

    // Calculate expiration time (24 hours from now)
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 60 * 60 * 24; // 1 day

    // Create the JWT token using jose
    const sessionToken = await new jose.SignJWT({
      userId: user.id,
      role: user.role,
      directLogin: true,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(secretKey);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Direct login successful",
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
      secure: false, // Allow non-HTTPS for development
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax",
    });
    response.cookies.set({
      name: "auth_status",
      value: "logged_in", // Changed from direct_login to logged_in to match what middleware expects
      httpOnly: false,
      secure: false,
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax",
    });

    // Set debug header
    response.headers.set("X-Direct-Login", "true");

    return response;
  } catch (error) {
    console.error("Direct login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error during direct login",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
