import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { query } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Force content type to be application/json
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    // Results object to collect diagnostic information
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      authentication: {
        cookies: {
          present: false,
          sessionToken: null as string | null,
          authStatus: null as string | null,
          allCookies: [] as string[]
        },
        token: {
          valid: false,
          decoded: null as any,
          error: null as string | null
        }
      },
      database: {
        connected: false,
        userCount: 0,
        error: null as string | null
      },
      nextjs: {
        baseUrl: request.nextUrl.origin,
        fullUrl: request.url,
        port: request.nextUrl.port
      },
      headers: {
        userAgent: request.headers.get('user-agent'),
        accept: request.headers.get('accept'),
        contentType: request.headers.get('content-type'),
        cookie: request.headers.get('cookie')
      }
    };
    
    // Check cookies
    const allCookies = Array.from(request.cookies.getAll());
    diagnostics.authentication.cookies.allCookies = allCookies.map(c => `${c.name}=${c.value.substring(0, 5)}...`);
    
    const sessionToken = request.cookies.get("session_token")?.value;
    const authStatus = request.cookies.get("auth_status")?.value;
    
    if (sessionToken) {
      diagnostics.authentication.cookies.present = true;
      diagnostics.authentication.cookies.sessionToken = sessionToken.substring(0, 10) + '...';
      
      // Try to verify the token
      try {
        const decoded = verify(
          sessionToken,
          process.env.JWT_SECRET || "your-secret-key"
        );
        
        diagnostics.authentication.token.valid = true;
        diagnostics.authentication.token.decoded = decoded;
      } catch (error) {
        diagnostics.authentication.token.valid = false;
        diagnostics.authentication.token.error = error instanceof Error ? error.message : String(error);
      }
    }
    
    if (authStatus) {
      diagnostics.authentication.cookies.authStatus = authStatus;
    }
    
    // Test database connection
    try {
      const dbTest = await query("SELECT COUNT(*) as count FROM users");
      diagnostics.database.connected = true;
      diagnostics.database.userCount = (dbTest as any)[0].count;
    } catch (error) {
      diagnostics.database.error = error instanceof Error ? error.message : String(error);
    }
    
    // Create response with all diagnostic information
    const response = NextResponse.json({
      success: true,
      message: "Diagnostic test completed",
      diagnostics
    });
    
    return response;
  } catch (error) {
    console.error("Diagnostic test error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error running diagnostic test",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 