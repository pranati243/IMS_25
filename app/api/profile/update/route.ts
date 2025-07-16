import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { jwtVerify } from "jose";
import { query } from "@/app/lib/db";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("session_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      decoded = payload;
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid session token" },
        { status: 401 }
      );
    }

    const { name, email, password, departmentId } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    let updateQuery = `UPDATE users SET name = ?, email = ?, department_id = ?`;
    const values: any[] = [name, email, departmentId || null];

    if (password && password.length >= 6) {
      const hashedPassword = await hash(password, 10);
      updateQuery += `, password = ?`;
      values.push(hashedPassword);
    }

    updateQuery += ` WHERE id = ?`;
    values.push(userId);

    await query(updateQuery, values);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Profile update failed:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
