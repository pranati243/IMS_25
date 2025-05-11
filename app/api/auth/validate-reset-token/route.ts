import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    console.log("Token validation request received for token:", token?.substring(0, 10) + "...");

    if (!token) {
      console.log("No token provided in request");
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

    console.log("Token validation successful for user:", tokenRecord.email);
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