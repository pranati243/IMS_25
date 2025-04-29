// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { query } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get the session token from cookies
    const sessionToken = (await cookies()).get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verify(
      sessionToken,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { userId: number; role: string };

    // Get user from database
    const users = await query(
      `
      SELECT 
        u.id, u.username, u.email, u.role, u.name
      FROM users u
      WHERE u.id = ? AND u.is_active = 1
      LIMIT 1
      `,
      [decoded.userId]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Get department info for faculty members
    let department = null;
    if (user.role === "hod" || user.role === "faculty") {
      const deptData = await query(
        `
        SELECT d.Department_Name
        FROM faculty f
        JOIN departments d ON f.F_dept = d.Department_Code
        WHERE f.Email = ?
        LIMIT 1
        `,
        [user.email]
      );

      if (deptData && deptData.length > 0) {
        department = deptData[0].Department_Name;
      }
    }

    // Get user permissions
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

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        department,
        permissions: permissionNames,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 401 }
    );
  }
}
