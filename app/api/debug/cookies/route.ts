import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sign } from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    // Force content type to be application/json
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    // Get all cookies from the request
    const allCookies = Array.from(request.cookies.getAll());
    
    // Create a session token if not present
    let sessionToken = request.cookies.get("session_token")?.value;
    let needsNewToken = false;
    
    // Check cookie header
    const cookieHeader = request.headers.get('cookie');
    
    // Create a response
    const response = new NextResponse(
      JSON.stringify({
        success: true,
        message: "Cookie debug information",
        cookies: allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 10) + '...' })),
        cookieHeader: cookieHeader || "No cookie header",
        sessionToken: sessionToken ? "Present" : "Missing",
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers }
    );
    
    // Set the auth_status cookie to help with debugging
    response.cookies.set({
      name: "auth_status",
      value: "debug_mode",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax",
    });
    
    // If session token missing, create a test one
    if (!sessionToken) {
      // Create a debug session token
      sessionToken = sign(
        {
          userId: 9999,
          role: "debug",
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: '1h' }
      );
      
      // Set the session token cookie
      response.cookies.set({
        name: "session_token",
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60, // 1 hour
        path: "/",
        sameSite: "lax",
      });
      
      needsNewToken = true;
    }
    
    // Also set a simple test cookie
    response.cookies.set({
      name: "test_cookie",
      value: "test_value",
      httpOnly: false,
      secure: false,
      maxAge: 60 * 60, // 1 hour
      path: "/",
      sameSite: "lax",
    });
    
    // Add note if we set a new token
    if (needsNewToken) {
      response.headers.set('X-Debug-Info', 'Created new debug session token');
    }
    
    return response;
  } catch (error) {
    console.error("Cookie debug error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error debugging cookies",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 