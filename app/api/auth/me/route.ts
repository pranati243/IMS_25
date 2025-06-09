// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose"; // Using jose instead of jsonwebtoken for Edge compatibility
import { query } from "@/app/lib/db";

// Use environment variable for JWT secret, with fallback for consistency
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secure-jwt-secret-for-ims-application-123";

export async function GET(request: NextRequest) {
  try {
    // Force content type to be application/json
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );

    // Log all headers for debugging
    console.log(
      "Request headers:",
      Array.from(request.headers.entries())
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")
    );

    // Log all cookies for debugging
    console.log(
      "All cookies:",
      Array.from(request.cookies.getAll())
        .map((c) => `${c.name}=${c.value.substring(0, 10)}...`)
        .join("; ")
    );

    // Get session token from cookies - try multiple approaches
    let sessionToken = request.cookies.get("session_token")?.value;

    if (!sessionToken) {
      // Try to parse from the Cookie header directly as a fallback
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        const cookies = cookieHeader.split(";");
        const sessionCookie = cookies.find((c) =>
          c.trim().startsWith("session_token=")
        );
        if (sessionCookie) {
          sessionToken = sessionCookie.split("=")[1];
          console.log("Found session token in cookie header");
        }
      }
    }

    // SPECIAL HANDLING FOR DEVELOPMENT MODE - For diagnostic purposes only
    if (
      process.env.NODE_ENV !== "production" &&
      request.cookies.get("auth_status")?.value === "direct_login"
    ) {
      console.log("Development mode: Using direct login fallback");

      try {
        // Get admin user in development mode
        const debugUsers = await query(
          `SELECT id, username, email, role, name, department_id
           FROM users 
           WHERE role = 'admin' 
           LIMIT 1`
        );

        if (debugUsers && (debugUsers as any[]).length > 0) {
          const user = (debugUsers as any[])[0];

          // Get user permissions
          const permissions = await query(
            `SELECT p.name
             FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permission_id
             WHERE rp.role = ?`,
            [user.role]
          );

          const permissionNames = (permissions as any[]).map((p) => p.name);

          // Create a new session token using jose instead of jsonwebtoken
          const encoder = new TextEncoder();
          const secretKey = encoder.encode(JWT_SECRET);
          const now = Math.floor(Date.now() / 1000);
          const exp = now + 60 * 60 * 24; // 1 day

          const newToken = await new jose.SignJWT({
            userId: user.id,
            role: user.role,
            debug: true,
          })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime(exp)
            .sign(secretKey);

          // Return success response with the user data
          const response = NextResponse.json(
            {
              success: true,
              user: {
                ...user,
                permissions: permissionNames,
              },
            },
            { status: 200, headers }
          );

          // Set new cookies
          response.cookies.set({
            name: "session_token",
            value: newToken,
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 24,
            path: "/",
            sameSite: "lax",
          });

          response.cookies.set({
            name: "auth_status",
            value: "debug_login",
            httpOnly: false,
            secure: false,
            maxAge: 60 * 60 * 24,
            path: "/",
            sameSite: "lax",
          });

          return response;
        }
      } catch (debugError) {
        console.error("Debug login failed:", debugError);
      }
    }

    if (!sessionToken) {
      console.log("No session token found");
      return new NextResponse(
        JSON.stringify({ success: false, message: "Not authenticated" }),
        { status: 401, headers }
      );
    }
    try {
      // Verify JWT token using jose instead of jsonwebtoken
      const encoder = new TextEncoder();
      const secretKey = encoder.encode(JWT_SECRET);

      // Verify and decode the token
      const { payload } = await jose.jwtVerify(sessionToken, secretKey);

      const decoded = {
        userId: payload.userId as number,
        role: payload.role as string,
      };

      console.log("Token verification successful for user ID:", decoded.userId);

      // Get user data from database
      const users = await query(
        `
        SELECT 
          u.id, u.username, u.email, u.role, u.name, u.department_id
        FROM users u
        WHERE u.id = ? AND u.is_active = 1
        LIMIT 1
        `,
        [decoded.userId]
      );

      if (!users || (users as any[]).length === 0) {
        console.log("User not found in database:", decoded.userId);
        return new NextResponse(
          JSON.stringify({ success: false, message: "User not found" }),
          { status: 404, headers }
        );
      }

      const user = (users as any[])[0];
      console.log("User found:", user.email);

      // Get department info if available
      let department;
      if (user.department_id) {
        const departments = await query(
          `SELECT Department_Name FROM department WHERE Department_ID = ?`,
          [user.department_id]
        );

        if (departments && (departments as any[]).length > 0) {
          department = (departments as any[])[0].Department_Name;
        }
      }

      // Get user permissions from role_permissions table
      const permissions = await query(
        `
        SELECT p.name
        FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role = ?
        `,
        [user.role]
      );

      const permissionNames = (permissions as any[]).map((p) => p.name);

      // Create response with the refreshed session token
      const response = new NextResponse(
        JSON.stringify({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            name: user.name,
            department,
            departmentId: user.department_id,
            permissions: permissionNames,
          },
        }),
        { status: 200, headers }
      ); // Generate a fresh token to extend the session
      const newToken = require("jsonwebtoken").sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Set the refreshed token in the response
      response.cookies.set({
        name: "session_token",
        value: newToken, // Use the new token to extend the session
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
        sameSite: "lax",
      });

      // Also set the auth_status cookie
      response.cookies.set({
        name: "auth_status",
        value: "logged_in",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24,
        path: "/",
        sameSite: "lax",
      });

      return response;
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError);

      // DEVELOPMENT MODE BYPASS - allow access for debugging
      if (
        process.env.NODE_ENV !== "production" &&
        request.cookies.get("auth_status")?.value
      ) {
        console.log(
          "DEV MODE: Token verification failed but auth_status cookie present, attempting direct access"
        );

        try {
          // Get admin user in development mode for quick testing
          const debugUsers = await query(
            `SELECT id, username, email, role, name, department_id
             FROM users 
             WHERE role = 'admin' 
             LIMIT 1`
          );

          if (debugUsers && (debugUsers as any[]).length > 0) {
            const user = (debugUsers as any[])[0];

            // Get permissions
            const permissions = await query(
              `SELECT p.name
               FROM permissions p
               JOIN role_permissions rp ON p.id = rp.permission_id
               WHERE rp.role = ?`,
              [user.role]
            );

            const permissionNames = (permissions as any[]).map((p) => p.name);

            // Create a new session token
            const newToken = require("jsonwebtoken").sign(
              { userId: user.id, role: user.role, debug: true },
              JWT_SECRET,
              { expiresIn: "24h" }
            );

            // Return success response with the user data
            const response = NextResponse.json(
              {
                success: true,
                user: {
                  ...user,
                  permissions: permissionNames,
                },
              },
              { status: 200, headers }
            );

            // Set new cookies
            response.cookies.set({
              name: "session_token",
              value: newToken,
              httpOnly: true,
              secure: false,
              maxAge: 60 * 60 * 24,
              path: "/",
              sameSite: "lax",
            });

            response.cookies.set({
              name: "auth_status",
              value: "debug_login",
              httpOnly: false,
              secure: false,
              maxAge: 60 * 60 * 24,
              path: "/",
              sameSite: "lax",
            });

            return response;
          }
        } catch (debugError) {
          console.error("Debug login bypass failed:", debugError);
        }
      }

      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Invalid authentication token",
          error:
            tokenError instanceof Error
              ? tokenError.message
              : String(tokenError),
        }),
        { status: 401, headers }
      );
    }
  } catch (error) {
    console.error("Error getting current user:", error);

    // Force content type to be application/json
    const headers = new Headers();
    headers.set("Content-Type", "application/json");

    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Authentication failed",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 401, headers }
    );
  }
}
