import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { jwtVerify } from "jose";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET!;

// Ensure signatures directory exists
async function ensureSignaturesDir() {
  const signaturesDir = path.join(process.cwd(), "public", "signatures");
  if (!existsSync(signaturesDir)) {
    await mkdir(signaturesDir, { recursive: true });
  }
  return signaturesDir;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("session_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      decoded = payload;
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid session token" },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const signatureFile = formData.get("signature") as File;
    const userId = formData.get("userId") as string;

    if (!signatureFile) {
      return NextResponse.json(
        { success: false, message: "No signature file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!signatureFile.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    if (signatureFile.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size should be less than 2MB" },
        { status: 400 }
      );
    }

    // Ensure signatures directory exists
    const signaturesDir = await ensureSignaturesDir();

    // Generate unique filename
    const fileExtension = signatureFile.name.split(".").pop();
    const filename = `signature_${userId}_${Date.now()}.${fileExtension}`;
    const filePath = path.join(signaturesDir, filename);

    // Save file
    const bytes = await signatureFile.arrayBuffer();
    await writeFile(filePath, new Uint8Array(bytes));

    // Save to database - Update faculty_details table where faculty info is stored
    const signatureUrl = `/signatures/${filename}`;
    await query(
      `UPDATE faculty_details SET signature_url = ? WHERE F_ID = (
        SELECT faculty_id FROM users WHERE id = ?
      )`,
      [signatureUrl, userId]
    );

    // Also update users table if it has signature field
    await query(`UPDATE users SET signature_url = ? WHERE id = ?`, [
      signatureUrl,
      userId,
    ]).catch(() => {
      // Ignore error if users table doesn't have signature_url column
    });

    return NextResponse.json({
      success: true,
      message: "Signature uploaded successfully",
      signatureUrl,
    });
  } catch (error) {
    console.error("Error uploading signature:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload signature" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("session_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      decoded = payload;
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid session token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    // Get current signature URL from faculty_details table
    const result = (await query(
      `SELECT signature_url FROM faculty_details WHERE F_ID = (
        SELECT faculty_id FROM users WHERE id = ?
      )`,
      [userId]
    )) as any[];

    const currentSignatureUrl = result[0]?.signature_url;

    // Remove from database
    await query(
      `UPDATE faculty_details SET signature_url = NULL WHERE F_ID = (
        SELECT faculty_id FROM users WHERE id = ?
      )`,
      [userId]
    );

    // Also update users table if it has signature field
    await query(`UPDATE users SET signature_url = NULL WHERE id = ?`, [
      userId,
    ]).catch(() => {
      // Ignore error if users table doesn't have signature_url column
    });

    // Remove file from disk
    if (currentSignatureUrl) {
      try {
        const filePath = path.join(
          process.cwd(),
          "public",
          currentSignatureUrl
        );
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (fileError) {
        console.error("Error deleting signature file:", fileError);
        // Continue even if file deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Signature removed successfully",
    });
  } catch (error) {
    console.error("Error removing signature:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove signature" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("session_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      decoded = payload;
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid session token" },
        { status: 401 }
      );
    }

    // Get current signature URL from faculty_details table
    const result = (await query(
      `SELECT signature_url FROM faculty_details WHERE F_ID = (
        SELECT faculty_id FROM users WHERE id = ?
      )`,
      [decoded.userId as string]
    )) as any[];

    const signatureUrl = result[0]?.signature_url || null;

    return NextResponse.json({
      success: true,
      signatureUrl,
    });
  } catch (error) {
    console.error("Error getting signature:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get signature" },
      { status: 500 }
    );
  }
}
