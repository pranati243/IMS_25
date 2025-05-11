import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { hash } from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body safely
    const body = await request.json().catch(() => ({}));
    const { token, password } = body;

    console.log("Password reset request received for token:", token?.substring(0, 10) + "...");

    // Validate input
    if (!token || !password) {
      console.log("Missing required fields:", { hasToken: !!token, hasPassword: !!password });
      return NextResponse.json(
        { success: false, message: "Token and password are required" },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      console.log("Password too short");
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
        t.used,
        u.email
      FROM 
        password_reset_tokens t
      JOIN 
        users u ON t.user_id = u.id
      WHERE 
        t.token = ? 
      LIMIT 1
      `,
      [token]
    ) as Array<{ id: number, user_id: number, expires_at: string, used: number, email: string }>;

    if (!tokenResults || tokenResults.length === 0) {
      console.log("Token not found in database");
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const tokenRecord = tokenResults[0];
    
    console.log("Token found:", {
      id: tokenRecord.id,
      user_id: tokenRecord.user_id,
      email: tokenRecord.email,
      expires_at: tokenRecord.expires_at,
      used: tokenRecord.used
    });
    
    // If token is already used, return error
    if (tokenRecord.used === 1) {
      console.log("Token has already been used");
      return NextResponse.json(
        { success: false, message: "This token has already been used" },
        { status: 400 }
      );
    }

    const now = new Date();
    const expiryDate = new Date(tokenRecord.expires_at);

    console.log("Current time:", now.toISOString());
    console.log("Token expiry time:", expiryDate.toISOString());
    console.log("Time difference (mins):", Math.round((expiryDate.getTime() - now.getTime()) / (60 * 1000)));

    if (now > expiryDate) {
      console.log("Token has expired");
      return NextResponse.json(
        { success: false, message: "Token has expired" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10);
    console.log("Password hashed successfully");

    // Update the user's password
    await query(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, tokenRecord.user_id]
    );
    console.log("User password updated successfully for user ID:", tokenRecord.user_id);

    // Mark the token as used
    await query(
      `UPDATE password_reset_tokens SET used = 1 WHERE id = ?`,
      [tokenRecord.id]
    );
    console.log("Token marked as used");

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