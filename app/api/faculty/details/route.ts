import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      F_ID,
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

    // Insert into faculty_details table
    await query(
      `
      INSERT INTO faculty_details (
        F_ID, Email, Phone_Number, PAN_Number, Aadhaar_Number,
        Highest_Degree, Area_of_Certification, Date_of_Joining,
        Experience, Past_Experience, Age, Current_Designation,
        Date_of_Birth, Nature_of_Association
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        F_ID,
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
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Faculty details added successfully",
    });
  } catch (error) {
    console.error("Error adding faculty details:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error adding faculty details",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 