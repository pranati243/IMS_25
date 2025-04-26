import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { OkPacket } from "mysql2";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const search = searchParams.get("search");

    let sql = `
      SELECT 
        f.F_id,
        f.F_name,
        f.F_dept,
        fd.Email,
        fd.Phone_Number,
        fd.Current_Designation,
        fd.Highest_Degree,
        fd.Experience,
        COUNT(DISTINCT fc.Contribution_ID) as total_contributions,
        COUNT(DISTINCT fpb.SrNo) as professional_memberships
      FROM faculty f
      LEFT JOIN faculty_details fd ON f.F_id = fd.F_ID
      LEFT JOIN faculty_contributions fc ON f.F_id = fc.F_ID
      LEFT JOIN faculty_professional_body fpb ON f.F_id = fpb.F_ID
    `;

    const params: (string | number | boolean | null)[] = [];
    const conditions = [];

    if (department) {
      conditions.push("f.F_dept = ?");
      params.push(department);
    }

    if (search) {
      conditions.push("(f.F_name LIKE ? OR fd.Email LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql +=
      " GROUP BY f.F_id, f.F_name, f.F_dept, fd.Email, fd.Phone_Number, fd.Current_Designation, fd.Highest_Degree, fd.Experience";

    const faculty = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: faculty,
    });
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { F_name, F_dept } = body;

    if (!F_name || !F_dept) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and department are required",
        },
        { status: 400 }
      );
    }

    try {
      // Insert into faculty table
      const result = (await query(
        `
        INSERT INTO faculty (F_name, F_dept)
        VALUES (?, ?)
      `,
        [F_name, F_dept]
      )) as OkPacket;

      return NextResponse.json({
        success: true,
        F_id: result.insertId,
      });
    } catch (insertError) {
      // If the error is related to auto_increment not set up, try to fix it
      if (
        insertError instanceof Error &&
        insertError.message.includes("ER_NO_DEFAULT_FOR_FIELD") &&
        insertError.message.includes("F_id")
      ) {
        // First alter the table to add AUTO_INCREMENT to F_id
        await query(
          "ALTER TABLE faculty MODIFY F_id bigint NOT NULL AUTO_INCREMENT"
        );

        // Then retry the insert
        const result = (await query(
          `
          INSERT INTO faculty (F_name, F_dept)
          VALUES (?, ?)
        `,
          [F_name, F_dept]
        )) as OkPacket;

        return NextResponse.json({
          success: true,
          F_id: result.insertId,
        });
      } else {
        // If it's another kind of error, rethrow it
        throw insertError;
      }
    }
  } catch (error) {
    console.error("Error adding faculty:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error adding faculty",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
