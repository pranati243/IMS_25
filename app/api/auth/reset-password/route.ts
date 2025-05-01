import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { hash } from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body safely
    const body = await request.json().catch(() => ({}));
    const { token, password } = body;

    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Token and password are required" },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if token exists and is not expired
    const tokenResults = await query(
      `
      SELECT 
        t.id, 
        t.user_id, 
        t.expires_at, 
        t.used
      FROM 
        password_reset_tokens t
      WHERE 
        t.token = ? 
        AND t.used = 0
      LIMIT 1
      `,
      [token]
    ) as Array<{ id: number, user_id: number, expires_at: string, used: number }>;

    if (!tokenResults || tokenResults.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const tokenRecord = tokenResults[0];
    const now = new Date();
    const expiryDate = new Date(tokenRecord.expires_at);

    if (now > expiryDate) {
      return NextResponse.json(
        { success: false, message: "Token has expired" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10);

    // Update the user's password
    await query(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, tokenRecord.user_id]
    );

    // Mark the token as used
    await query(
      `UPDATE password_reset_tokens SET used = 1 WHERE id = ?`,
      [tokenRecord.id]
    );

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reset password" },
      { status: 500 }
    );
  }
} 