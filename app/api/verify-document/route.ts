import { NextRequest, NextResponse } from "next/server";
import {
  verifyAwardDocument,
  verifyMembershipDocument,
} from "@/app/lib/document-verification-mock-v2";

export async function getVerificationServiceHealth() {
  return {
    status: "healthy",
    ocrEngine: "mock",
    timestamp: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const certificateFile = formData.get("certificate") as File;
    const verificationType = formData.get("type") as string;
    const verificationData = formData.get("data") as string;

    if (!certificateFile) {
      return NextResponse.json(
        { success: false, message: "Certificate file is required" },
        { status: 400 }
      );
    }

    if (
      !verificationType ||
      !["award", "membership"].includes(verificationType)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid verification type (award/membership) is required",
        },
        { status: 400 }
      );
    }

    if (!verificationData) {
      return NextResponse.json(
        { success: false, message: "Verification data is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (
      !certificateFile.type.startsWith("image/") &&
      certificateFile.type !== "application/pdf"
    ) {
      return NextResponse.json(
        { success: false, message: "Only image files and PDFs are supported" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (certificateFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await certificateFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse verification data
    let parsedData;
    try {
      parsedData = JSON.parse(verificationData);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid verification data format" },
        { status: 400 }
      );
    }

    // Perform verification based on type
    let verificationResult;

    if (verificationType === "award") {
      verificationResult = await verifyAwardDocument(buffer, parsedData);
    } else {
      verificationResult = await verifyMembershipDocument(buffer, parsedData);
    }

    return NextResponse.json({
      success: true,
      verification: verificationResult,
      message: verificationResult.isValid
        ? "Certificate verification completed successfully"
        : "Certificate verification completed with concerns",
    });
  } catch (error) {
    console.error("Document verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Document verification failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check endpoint
    const health = getVerificationServiceHealth();

    return NextResponse.json({
      success: true,
      service: "Document Verification Service",
      ...health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Service health check failed" },
      { status: 500 }
    );
  }
}
