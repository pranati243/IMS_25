import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { compare, hash } from "bcrypt";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { message: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const users = await query(
      `
      SELECT 
        u.id, u.username, u.email, u.password, u.role, u.name, u.is_active
      FROM users u
      WHERE u.email = ?
      LIMIT 1
      `,
      [email]
    );

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const user = users[0];
    
    // For security, don't return the password hash in production
    if (process.env.NODE_ENV === "production") {
      user.password = "REDACTED";
    }

    // Check if user is active
    const isActive = user.is_active === 1;

    return NextResponse.json({
      user: {
        ...user,
        // Add debugging information
        isActive,
        passwordFormat: user.password ? `${user.password.substring(0, 10)}...` : "No password",
        loginConditions: {
          emailFound: true,
          isActive,
        }
      },
      message: "User debug information",
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { message: "Error retrieving user information", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, testPassword } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get user from database
    const users = await query(
      `
      SELECT 
        u.id, u.username, u.email, u.password, u.role, u.name, u.is_active
      FROM users u
      WHERE u.email = ?
      LIMIT 1
      `,
      [email]
    );

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const user = users[0];
    
    // Check if password matches
    const passwordMatch = await compare(password, user.password);

    // If testPassword is provided, generate a hash for it
    let testHash = null;
    if (testPassword) {
      testHash = await hash(testPassword, 10);
    }

    return NextResponse.json({
      success: passwordMatch,
      message: passwordMatch ? "Password matches" : "Password does not match",
      debug: {
        email,
        userId: user.id,
        isActive: user.is_active === 1,
        passwordLength: user.password?.length,
        testHash: testHash ? `${testHash.substring(0, 15)}...` : null,
      }
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { message: "Error checking credentials", error: String(error) },
      { status: 500 }
    );
  }
} 