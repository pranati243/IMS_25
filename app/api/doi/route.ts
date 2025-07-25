import { NextRequest, NextResponse } from "next/server";
import { getDoiMetadata, getEnhancedDoiMetadata } from "@/app/lib/doi";

export async function GET(request: NextRequest) {
  try {
    // Extract DOI from query parameters
    const doi = request.nextUrl.searchParams.get("doi");
    const enhanced = request.nextUrl.searchParams.get("enhanced") === "true";

    if (!doi) {
      return NextResponse.json(
        { success: false, message: "DOI parameter is required" },
        { status: 400 }
      );
    }

    // Call the appropriate DOI metadata retrieval function
    const result = enhanced
      ? await getEnhancedDoiMetadata(doi)
      : await getDoiMetadata(doi);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    // Return the metadata
    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in DOI lookup API:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve DOI metadata",
      },
      { status: 500 }
    );
  }
}
