// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from "jsonwebtoken";

// Define public paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/bypass-middleware",
  "/api/debug/auth",
  "/api/debug/auth-fix",
  "/api/debug/faculty-check",
  "/api/debug/init-faculty-tables",
  "/api/debug/fix-faculty-columns",
  "/api/debug/fix-passwords",
  "/api/debug/direct-login",
  "/api/debug/fix-database",
  "/api/debug/diagnostic",
  "/api/debug/cookies",
  "/api/debug/bypass-auth",
  "/api/debug/faculty-edit-test",
];

// API paths that should still be accessible but need proper JSON headers
const apiPaths = [
  "/api/auth/me",
  "/api/departments",
  "/api/departments/stats",
  "/api/faculty",
  "/api/faculty/details",
  "/api/faculty/by-email",
  "/api/faculty/contributions",
  "/api/faculty/[id]",
  "/api/reports",
  "/api/admin",
  "/api/users"
];

// Hard-coded secret key for development to ensure consistency
const JWT_SECRET = "your-secure-jwt-secret-for-ims-application-123";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  
  // Debug cookie information
  const cookieHeader = request.headers.get('cookie');
  const sessionCookie = request.cookies.get("session_token");
  const authStatus = request.cookies.get("auth_status");
  
  console.log(`Middleware: Path=${pathname}, SessionCookie=${sessionCookie ? "Present" : "Missing"}, AuthStatus=${authStatus ? "Present" : "Missing"}`);
  
  // For API routes, ensure we set proper headers
  if (pathname.startsWith('/api/')) {
    // Add proper headers to ensure API responses are treated as JSON
    requestHeaders.set('Accept', 'application/json');
    requestHeaders.set('Content-Type', 'application/json');
    
    // If we have cookie credentials, make sure they're included
    if (cookieHeader) {
      requestHeaders.set('Cookie', cookieHeader);
    }
    
    // Create a response with updated headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    // Public API routes don't need authentication
    if (publicPaths.some(path => pathname === path || pathname.startsWith(path + "/"))) {
      console.log(`Allowing access to public API path: ${pathname}`);
      return response;
    }
    
    // Only check authentication for specified API paths that need it
    const requiresAuth = apiPaths.some(path => pathname === path || pathname.startsWith(path + "/"));
    if (!requiresAuth) {
      console.log(`API path not in authenticated list: ${pathname}`);
      return response;
    }
    
    // For auth-requiring API routes, check the token
    const sessionToken = request.cookies.get("session_token")?.value;
    
    // DEVELOPMENT MODE: Allow access to all API endpoints without authentication
    if (process.env.NODE_ENV !== "production") {
      console.log(`DEVELOPMENT MODE: Bypassing authentication for API path: ${pathname}`);
      return response;
    }
    
    if (!sessionToken) {
      console.log(`API authentication failed - no session token: ${pathname}`);
      // Return 401 for API routes instead of redirecting
      return new NextResponse(
        JSON.stringify({ success: false, message: "Authentication required" }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    try {
      // Verify the token with consistent secret
      verify(sessionToken, JWT_SECRET);
      console.log(`API authentication successful: ${pathname}`);
      
      // Add cookie to the response to ensure it's properly passed through
      const updatedResponse = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
      // Add session cookie to response to refresh/extend it
      updatedResponse.cookies.set("session_token", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
        sameSite: "lax",
      });
      
      // Also set the auth_status cookie
      updatedResponse.cookies.set("auth_status", "logged_in", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production", 
        maxAge: 60 * 60 * 24,
        path: "/",
        sameSite: "lax", 
      });
      
      return updatedResponse;
    } catch (error) {
      console.log(`API authentication failed - invalid token: ${pathname}`);
      // Return 401 for invalid tokens on API routes
      return new NextResponse(
        JSON.stringify({ success: false, message: "Invalid authentication token" }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }
  
  // Check if the path is for static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Allow access to public paths
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + "/"))) {
    return NextResponse.next();
  }

  // For browser routes, redirect to login if no session
  const sessionToken = request.cookies.get("session_token")?.value;
  if (!sessionToken) {
    console.log(`Browser path requires authentication - redirecting: ${pathname}`);
    
    // Create a full URL preserving the current port
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    
    // Log the redirection URL
    console.log(`Redirecting to: ${url.toString()}`);
    
    return NextResponse.redirect(url);
  }

  try {
    // Verify the token with consistent secret
    verify(sessionToken, JWT_SECRET);
    console.log(`Browser authentication successful: ${pathname}`);
    
    // Refresh the cookie in the response
    const response = NextResponse.next();
    
    // Add session cookie to response to refresh it
    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax", // Less restrictive to work with port changes
    });
    
    // Also set auth_status cookie
    response.cookies.set("auth_status", "logged_in", {
      httpOnly: false, 
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
      sameSite: "lax",
    });
    
    return response;
  } catch (error: any) {
    console.log(`Browser authentication failed - invalid token: ${pathname}, Error: ${error?.message || 'Unknown error'}`);
    
    // For development mode: bypass token verification if auth_status cookie is present
    if (authStatus && process.env.NODE_ENV !== "production") {
      console.log(`DEVELOPMENT MODE: Bypassing token verification for path: ${pathname}`);
      return NextResponse.next();
    }
    
    // Create a full URL preserving the current port
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    
    // Log the redirection URL
    console.log(`Redirecting to: ${url.toString()}`);
    
    return NextResponse.redirect(url);
  }
}

// Specify which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for specific static files
     */
    "/((?!_next/static|_next/image).*)",
  ],
}; 