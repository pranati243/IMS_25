import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Set explicit headers
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  return new NextResponse(
    JSON.stringify({
      success: true,
      message: "This endpoint is working and returning proper JSON",
      headers_received: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers
    }
  );
} 