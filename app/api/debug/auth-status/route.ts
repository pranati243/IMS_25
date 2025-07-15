// app/api/debug/auth-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// Use environment variable for JWT secret, with fallback for consistency
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: NextRequest) {
  // Force content type to be application/json
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );

  try {
    // Get all cookies for debugging
    const cookies = request.cookies.getAll();
    const cookieList = cookies.map((c) => ({
      name: c.name,
      value: c.name === "session_token" ? "***REDACTED***" : c.value,
      path: c.path || "/",
      domain: c.domain || "current domain",
      secure: c.secure || false,
      httpOnly: c.httpOnly || false,
      sameSite: c.sameSite || "lax",
    }));

    // Check session token
    let tokenStatus = "missing";
    let tokenValid = false;
    let tokenData = null;

    const sessionToken = request.cookies.get("session_token")?.value;
    if (sessionToken) {
      tokenStatus = "present";
      try {
        const decoded = verify(sessionToken, JWT_SECRET);
        tokenValid = true;
        tokenData = {
          userId: (decoded as any).userId,
          role: (decoded as any).role,
          exp: (decoded as any).exp,
          iat: (decoded as any).iat,
          expiresIn: (decoded as any).exp * 1000 - Date.now(),
        };
      } catch (error) {
        tokenValid = false;
        tokenStatus = "invalid";
      }
    }

    // Check auth status cookie
    const authStatus = request.cookies.get("auth_status")?.value || "not set";

    return new NextResponse(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        authState: {
          tokenStatus,
          tokenValid,
          tokenData,
          authStatus,
        },
        cookies: cookieList,
        headers: Object.fromEntries(request.headers.entries()),
        url: request.url,
        method: request.method,
      }),
      { status: 200, headers }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers }
    );
  }
}
