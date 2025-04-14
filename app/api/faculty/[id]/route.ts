import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get faculty and faculty details
    const faculty = await query(
      `
      SELECT 
        f.*,
        fd.*
      FROM faculty f
      LEFT JOIN faculty_details fd ON f.F_id = fd.F_ID
      WHERE f.F_id = ?
    `,
      [params.id]
    );

    if (!faculty || !faculty[0]) {
      return NextResponse.json(
        {
          success: false,
          message: "Faculty not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(faculty[0]);
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching faculty data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      F_name,
      F_dept,
      Email,
      Phone_Number,
      PAN_Number,
      Aadhaar_Number,
      Highest_Degree,
      Area_of_Certification,
      Date_of_Joining,
      Experience,
      Past_Experience,
      Age,
      Current_Designation,
      Date_of_Birth,
      Nature_of_Association,
    } = body;

    // Update faculty table
    await query(
      `
      UPDATE faculty 
      SET F_name = ?, F_dept = ?
      WHERE F_id = ?
    `,
      [F_name, F_dept, params.id]
    );

    // Update faculty_details table
    await query(
      `
      UPDATE faculty_details 
      SET 
        Email = ?,
        Phone_Number = ?,
        PAN_Number = ?,
        Aadhaar_Number = ?,
        Highest_Degree = ?,
        Area_of_Certification = ?,
        Date_of_Joining = ?,
        Experience = ?,
        Past_Experience = ?,
        Age = ?,
        Current_Designation = ?,
        Date_of_Birth = ?,
        Nature_of_Association = ?
      WHERE F_ID = ?
    `,
      [
        Email,
        Phone_Number,
        PAN_Number,
        Aadhaar_Number,
        Highest_Degree,
        Area_of_Certification,
        Date_of_Joining,
        Experience,
        Past_Experience,
        Age,
        Current_Designation,
        Date_of_Birth,
        Nature_of_Association,
        params.id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Faculty updated successfully",
    });
  } catch (error) {
    console.error("Error updating faculty:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating faculty",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 