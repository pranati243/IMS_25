import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Only allow PDF and image files
  const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  // Ensure upload directory exists
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  // Generate a unique filename
  const ext = file.name.split(".").pop();
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const fileName = `${baseName}-${Date.now()}.${ext}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  // Save the file
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);

  // Return the public URL
  const url = `/uploads/${fileName}`;
  return NextResponse.json({ url });
} 