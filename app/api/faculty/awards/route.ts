import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const facultyId = searchParams.get("facultyId");

    if (!facultyId) {
      return NextResponse.json(
        { success: false, message: "Faculty ID is required" },
        { status: 400 }
      );
    }

    const awards = await query(
      `SELECT award_id, faculty_id, award_name, awarding_organization as organization, award_description, award_date as date, category, certificate FROM faculty_awards WHERE faculty_id = ? ORDER BY award_date DESC`,
      [facultyId]
    );

    return NextResponse.json({ success: true, data: awards });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch awards",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload with FormData
      const formData = await request.formData();

      const award_name = formData.get("award_name") as string;
      const awarding_organization = formData.get(
        "awarding_organization"
      ) as string;
      const award_description = formData.get("award_description") as string;
      const award_date = formData.get("award_date") as string;
      const category = formData.get("category") as string;
      const facultyId = formData.get("facultyId") as string;
      const certificateFile = formData.get("certificate") as File;

      // Validate required fields
      if (!award_name || !awarding_organization || !award_date) {
        return NextResponse.json(
          {
            success: false,
            message: "Title, awarding organization, and date are required",
          },
          { status: 400 }
        );
      }

      if (!facultyId) {
        return NextResponse.json(
          { success: false, message: "Faculty ID is required" },
          { status: 400 }
        );
      }

      let certificatePath = null;

      if (certificateFile && certificateFile.size > 0) {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(
          process.cwd(),
          "public/uploads/certificates"
        );
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const fileName = `${Date.now()}-${certificateFile.name}`;
        const filePath = path.join(uploadsDir, fileName);

        // Save file
        const buffer = await certificateFile.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));

        certificatePath = `/uploads/certificates/${fileName}`;
      }

      const result = await query(
        `INSERT INTO faculty_awards 
          (faculty_id, award_name, awarding_organization, award_description, award_date, category, certificate) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          facultyId,
          award_name,
          awarding_organization,
          award_description || null,
          award_date,
          category,
          certificatePath,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Award added successfully",
        data: {
          award_id: (result as any).insertId,
          faculty_id: facultyId,
          award_name,
          organization: awarding_organization,
          award_description,
          date: award_date,
          category,
          certificate: certificatePath,
        },
      });
    } else {
      // Handle JSON body
      const body = await request.json();
      const {
        award_name,
        awarding_organization,
        award_description,
        award_date,
        category,
        facultyId,
      } = body;

      // Validate required fields
      if (!award_name || !awarding_organization || !award_date) {
        return NextResponse.json(
          {
            success: false,
            message: "Title, awarding organization, and date are required",
          },
          { status: 400 }
        );
      }

      if (!facultyId) {
        return NextResponse.json(
          { success: false, message: "Faculty ID is required" },
          { status: 400 }
        );
      }

      const result = await query(
        `INSERT INTO faculty_awards 
          (faculty_id, award_name, awarding_organization, award_description, award_date, category, certificate) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          facultyId,
          award_name,
          awarding_organization,
          award_description || null,
          award_date,
          category,
          null,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Award added successfully",
        data: {
          award_id: (result as any).insertId,
          faculty_id: facultyId,
          award_name,
          organization: awarding_organization,
          award_description,
          date: award_date,
          category,
          certificate: null,
        },
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add award",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const awardId = searchParams.get("awardId");

    if (!awardId) {
      return NextResponse.json(
        { success: false, message: "Award ID is required" },
        { status: 400 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload with FormData
      const formData = await request.formData();

      const award_name = formData.get("award_name") as string;
      const awarding_organization = formData.get(
        "awarding_organization"
      ) as string;
      const award_description = formData.get("award_description") as string;
      const award_date = formData.get("award_date") as string;
      const category = formData.get("category") as string;
      const certificateFile = formData.get("certificate") as File;

      let certificatePath = null;

      if (certificateFile && certificateFile.size > 0) {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(
          process.cwd(),
          "public/uploads/certificates"
        );
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const fileName = `${Date.now()}-${certificateFile.name}`;
        const filePath = path.join(uploadsDir, fileName);

        // Save file
        const buffer = await certificateFile.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));

        certificatePath = `/uploads/certificates/${fileName}`;
      }

      // If a new certificate is uploaded, update it; otherwise, keep the old one
      let updateSql = `UPDATE faculty_awards SET award_name = ?, awarding_organization = ?, award_description = ?, award_date = ?, category = ?`;
      let params = [
        award_name,
        awarding_organization,
        award_description || null,
        award_date,
        category,
      ];

      if (certificatePath) {
        updateSql += `, certificate = ?`;
        params.push(certificatePath);
      }

      updateSql += ` WHERE award_id = ?`;
      params.push(awardId);

      await query(updateSql, params);

      return NextResponse.json({
        success: true,
        message: "Award updated successfully",
      });
    } else {
      // Handle JSON body (no file upload)
      const body = await request.json();
      const {
        award_name,
        awarding_organization,
        award_description,
        award_date,
        category,
      } = body;

      await query(
        `UPDATE faculty_awards SET award_name = ?, awarding_organization = ?, award_description = ?, award_date = ?, category = ? WHERE award_id = ?`,
        [
          award_name,
          awarding_organization,
          award_description || null,
          award_date,
          category,
          awardId,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Award updated successfully",
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update award",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const awardId = searchParams.get("awardId");

    if (!awardId) {
      return NextResponse.json(
        { success: false, message: "Award ID is required" },
        { status: 400 }
      );
    }

    await query("DELETE FROM faculty_awards WHERE award_id = ?", [awardId]);

    return NextResponse.json({
      success: true,
      message: "Award deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete award",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
