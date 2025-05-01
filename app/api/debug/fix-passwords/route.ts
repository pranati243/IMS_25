import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { hash } from "bcrypt";

// WARNING: This is an admin utility endpoint and should be removed or secured in production
export async function GET(request: NextRequest) {
  try {
    // Get user email from query params (for specific user fix)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    
    // Default password to use for rehashing
    const defaultPassword = "password123";
    
    // Hash the default password
    const hashedPassword = await hash(defaultPassword, 10);

    let userCount = 0;
    
    if (email) {
      // Update specific user
      const result = await query(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashedPassword, email]
      );
      
      // @ts-ignore
      userCount = result.affectedRows || 0;
    } else {
      // Update all users with invalid password hashes
      const result = await query(
        "UPDATE users SET password = ? WHERE password IS NULL OR password = '' OR password NOT LIKE '$2%'",
        [hashedPassword]
      );
      
      // @ts-ignore
      userCount = result.affectedRows || 0;
    }
    
    return NextResponse.json({
      success: true,
      message: `Fixed passwords for ${userCount} users. New password is "${defaultPassword}"`,
      count: userCount,
    });
  } catch (error) {
    console.error("Error fixing passwords:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fixing passwords",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 