import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
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
        AND t.used = 0
      LIMIT 1
      `,
      [token]
    ) as Array<{ 
      id: number, 
      user_id: number, 
      expires_at: string, 
      used: number,
      email: string 
    }>;

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

    return NextResponse.json({
      success: true,
      email: tokenRecord.email,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to validate token" },
      { status: 500 }
    );
  }
} 