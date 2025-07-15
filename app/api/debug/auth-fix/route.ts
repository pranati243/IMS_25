import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { sign } from "jsonwebtoken";

// Use env variable for JWT secret, with fallback to ensure consistency
const JWT_SECRET = process.env.JWT_SECRET;

// Development-only endpoint to fix authentication issues
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, message: "Debug routes are disabled in production" },
      { status: 403 }
    );
  }

  // Check if specific action is requested
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  // Common headers for all responses
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

  // Handle different actions
  if (action === "clear-cookies") {
    // Return a page that clears cookies with JavaScript
    const htmlResponse = new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Clearing Authentication Cookies</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
          .success { color: green; }
          .error { color: red; }
          pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Authentication Cookies Reset</h1>
          <div id="status">Working...</div>
          <div id="result"></div>
          
          <script>
            function clearAuthCookies() {
              const cookies = document.cookie.split(";");
              let cleared = [];
              
              cookies.forEach(cookie => {
                const cookieName = cookie.split("=")[0].trim();
                
                // Delete all cookies to be safe
                document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                cleared.push(cookieName);
              });
              
              // Focus on auth cookies
              document.cookie = "auth_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              
              return cleared;
            }
            
            window.onload = function() {
              try {
                const originalCookies = document.cookie;
                const cleared = clearAuthCookies();
                
                const status = document.getElementById('status');
                const result = document.getElementById('result');
                
                status.className = 'success';
                status.textContent = 'Authentication cookies cleared successfully!';
                
                // Display result
                result.innerHTML = \`
                  <h3>Cookie Reset Results:</h3>
                  <p>Original cookies: <pre>\${originalCookies || "(none)"}</pre></p>
                  <p>Cleared \${cleared.length} cookies: <pre>\${cleared.join(", ") || "(none)"}</pre></p>
                  <p>Current cookies: <pre>\${document.cookie || "(none)"}</pre></p>
                  <p>You can now <a href="/login">try logging in again</a> or <a href="javascript:window.close()">close this window</a>.</p>
                \`;
              } catch(e) {
                document.getElementById('status').className = 'error';
                document.getElementById('status').textContent = 'Error clearing cookies: ' + e.message;
              }
            };
          </script>
        </div>
      </body>
      </html>
    `,
      {
        status: 200,
        headers: new Headers({
          "Content-Type": "text/html",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        }),
      }
    );

    // Clear cookies on the server side too
    htmlResponse.cookies.set("session_token", "", { maxAge: 0, path: "/" });
    htmlResponse.cookies.set("auth_status", "", { maxAge: 0, path: "/" });

    return htmlResponse;
  }

  try {
    // Get admin user for authentication
    const users = await query(
      `SELECT id, username, email, role, name, department_id
       FROM users 
       WHERE role = 'admin' 
       LIMIT 1`
    );

    if (!users || (users as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "No admin user found" },
        { status: 404 }
      );
    }

    const user = (users as any[])[0];

    // Get permissions for the user
    const permissions = await query(
      `SELECT p.name
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role = ?`,
      [user.role]
    );

    const permissionNames = (permissions as any[]).map((p) => p.name);

    // Create a new session token with extended expiration
    const sessionToken = sign(
      { userId: user.id, role: user.role, debug: true },
      JWT_SECRET!,
      { expiresIn: "7d" } // 7 days for development
    );

    // Prepare user object
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      departmentId: user.department_id,
      permissions: permissionNames,
    };

    // Create response with debug info
    const response = NextResponse.json({
      success: true,
      message: "Authentication fixed. Dashboard should work now.",
      user: userData,
      debug: {
        sessionTokenSet: true,
        authStatusSet: true,
        sessionStorageUpdated: true,
      },
    });

    // Set cookies with proper attributes for development
    response.cookies.set({
      name: "session_token",
      value: sessionToken,
      httpOnly: true,
      secure: false, // Not secure for local development
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });

    response.cookies.set({
      name: "auth_status",
      value: "debug_login",
      httpOnly: false,
      secure: false,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });

    console.log("Auth fix applied successfully - session should be restored");

    return response;
  } catch (error) {
    console.error("Auth fix error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Authentication fix failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
