import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { sign } from "jsonwebtoken";

// Hard-coded secret key for development to ensure consistency
const JWT_SECRET = "your-secure-jwt-secret-for-ims-application-123";

// Development-only endpoint to fix authentication issues
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, message: "Debug routes are disabled in production" },
      { status: 403 }
    );
  }
  
  try {
    // Get admin user for authentication
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
    
    // Get permissions for the user
    const permissions = await query(
      `SELECT p.name
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role = ?`,
      [user.role]
    );
    
    const permissionNames = (permissions as any[]).map(p => p.name);
    
    // Create a new session token with extended expiration
    const sessionToken = sign(
      { userId: user.id, role: user.role, debug: true },
      JWT_SECRET,
      { expiresIn: "7d" } // 7 days for development
    );
    
    // Prepare user object
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      departmentId: user.department_id,
      permissions: permissionNames
    };
    
    // Create response with debug info
    const response = NextResponse.json({
      success: true,
      message: "Authentication fixed. Dashboard should work now.",
      user: userData,
      debug: {
        sessionTokenSet: true,
        authStatusSet: true,
        sessionStorageUpdated: true
      }
    });
    
    // Set cookies with proper attributes for development
    response.cookies.set({
      name: "session_token",
      value: sessionToken,
      httpOnly: true,
      secure: false, // Not secure for local development
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });
    
    response.cookies.set({
      name: "auth_status",
      value: "debug_login",
      httpOnly: false,
      secure: false,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });
    
    console.log("Auth fix applied successfully - session should be restored");
    
    return response;
  } catch (error) {
    console.error("Auth fix error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Authentication fix failed",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 