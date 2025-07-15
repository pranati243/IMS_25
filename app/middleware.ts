// // app/middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { hasPermission } from "./lib/auth/permissions";

// // API routes that require authentication and authorization
// const protectedApiRoutes = [
//   // Faculty
//   { path: "/api/faculty", resource: "faculty", action: "read" },
//   { path: "/api/faculty/create", resource: "faculty", action: "create" },
//   { path: "/api/faculty/update", resource: "faculty", action: "update" },
//   { path: "/api/faculty/delete", resource: "faculty", action: "delete" },

//   // student
//   { path: "/api/student", resource: "student", action: "read" },
//   { path: "/api/student/create", resource: "student", action: "create" },
//   { path: "/api/student/update", resource: "student", action: "update" },
//   { path: "/api/student/delete", resource: "student", action: "delete" },

//   // Departments
//   { path: "/api/departments", resource: "department", action: "read" },
//   { path: "/api/departments/update", resource: "department", action: "update" },

//   // Announcements
//   {
//     path: "/api/announcements/create",
//     resource: "announcement",
//     action: "create",
//   },
//   {
//     path: "/api/announcements/update",
//     resource: "announcement",
//     action: "update",
//   },
//   {
//     path: "/api/announcements/delete",
//     resource: "announcement",
//     action: "delete",
//   },
// ];

// export async function middleware(request: NextRequest) {
//   // Skip auth check for non-API routes and auth-related routes
//   if (
//     !request.nextUrl.pathname.startsWith("/api") ||
//     request.nextUrl.pathname.startsWith("/api/auth")
//   ) {
//     return NextResponse.next();
//   }

//   // Get user token from session
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   // No token means not authenticated
//   if (!token) {
//     return new NextResponse(
//       JSON.stringify({ error: "Authentication required" }),
//       { status: 401, headers: { "content-type": "application/json" } }
//     );
//   }

//   // Find matching protected route
//   const matchedRoute = protectedApiRoutes.find((route) =>
//     request.nextUrl.pathname.startsWith(route.path)
//   );

//   // Check permission for protected routes
//   if (matchedRoute) {
//     const userHasPermission = hasPermission(
//       token.role,
//       matchedRoute.resource,
//       matchedRoute.action
//     );

//     if (!userHasPermission) {
//       return new NextResponse(JSON.stringify({ error: "Permission denied" }), {
//         status: 403,
//         headers: { "content-type": "application/json" },
//       });
//     }
//   }

//   return NextResponse.next();
// }

// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// Routes that require authentication
const protectedApiPaths = [
  "/api/departments",
  "/api/faculty",
  "/api/student",
  "/api/courses",
];

// Client routes that require authentication
const protectedClientPaths = [
  "/dashboard",
  "/admin",
  "/faculty/manage",
  "/student/manage",
  "/settings",
  "/departments",
  // "/profile", - temporarily removing profile from protected routes
];

// Routes that require specific roles
const adminOnlyApiPaths = ["/api/admin", "/api/users"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for auth API routes
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Skip auth check for profile page temporarily
  if (pathname === "/profile") {
    return NextResponse.next();
  }

  // Check if it's a protected API route
  const isProtectedApiRoute = protectedApiPaths.some((route) =>
    pathname.startsWith(route)
  );

  const isAdminOnlyApiRoute = adminOnlyApiPaths.some((route) =>
    pathname.startsWith(route)
  );

  // Check if it's a protected client route
  const isProtectedClientRoute = protectedClientPaths.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedApiRoute && !isAdminOnlyApiRoute && !isProtectedClientRoute) {
    return NextResponse.next();
  }

  // Get the token from the cookies
  const sessionToken = request.cookies.get("session_token")?.value;

  if (!sessionToken) {
    // For API routes, return 401
    if (isProtectedApiRoute || isAdminOnlyApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For client routes, redirect to login
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  try {
    // Verify the token
    const secret = process.env.JWT_SECRET || "your-secret-key";
    const decodedToken = verify(sessionToken, secret) as {
      userId: string;
      role: string;
    };

    // Check admin access for admin-only routes
    if (isAdminOnlyApiRoute && decodedToken.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Add the user to the request
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decodedToken.userId);
    requestHeaders.set("x-user-role", decodedToken.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Authentication error:", error);

    // For API routes, return 401
    if (isProtectedApiRoute || isAdminOnlyApiRoute) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // For client routes, redirect to login
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
    );
  }
}

export const config = {
  matcher: [
    // Match all API routes
    "/api/:path*",
    // Match client routes that need protection
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/faculty/manage/:path*",
    "/student/manage/:path*",
    "/settings/:path*",
    "/departments/:path*",
  ],
};
