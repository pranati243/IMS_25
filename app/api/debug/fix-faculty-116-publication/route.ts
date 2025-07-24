// app/api/debug/fix-faculty-116-publication/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

/**
 * This is a debug endpoint to fix the publication count discrepancy for faculty ID 116 (Dr. Smita Dange)
 * It ensures the missing conference paper is added to the database
 */
export async function GET(request: NextRequest) {
  try {
    // Make sure this endpoint is only accessible in development
    //if (process.env.NODE_ENV === "production") {
     // return NextResponse.json(
        //{ success: false, message: "Not available in production" },
       // { status: 403 }
      //);
    //}

    // Check if the publication already exists to avoid duplicates
    const existingCheck = await query(
      `SELECT id FROM conference_publications 
       WHERE user_id = ? 
       AND Title_Of_The_Paper = ? 
       AND Name_Of_The_Conference LIKE '%Advances in Science and Technology%'`,
      [
        "116",
        "Machine Learning Approach for Educational Content Recommendation",
      ]
    );

    if ((existingCheck as any[]).length > 0) {
      return NextResponse.json({
        success: true,
        message: "Publication already exists, no action needed",
        publicationId: (existingCheck as any[])[0].id,
      });
    }

    // Add the missing conference publication
    const result = await query(`
      INSERT INTO conference_publications (
        Academic_Year,
        Name_Of_The_Teacher,
        Branch,
        Title_Of_The_Paper,
        Title_Of_The_Proceedings,
        Name_Of_The_Conference,
        National_Or_International,
        Year_Of_Publication,
        ISBN_Or_ISSN_Number,
        Affiliating_Institute,
        Name_Of_Publisher,
        Details_Of_Paper,
        Indexing,
        other,
        user_id,
        STATUS,
        publication_date,
        is_full_date_known,
        faculty_id
      ) VALUES (
        '2023-24',
        'Dr. Smita Dange',
        'Computer Engineering',
        'Machine Learning Approach for Educational Content Recommendation',
        'Proceedings of the 6th International Conference on Advances in Science and Technology',
        '6th International Conference on Advances in Science and Technology',
        'International',
        '2023',
        'ISBN:979-8-3503-5981-7',
        'Fr. C. Rodrigues Institute of Technology',
        'IEEE',
        'Dr. Smita Dange et al., "Machine Learning Approach for Educational Content Recommendation," 6th International Conference on Advances in Science and Technology (ICAST-2023), 2023',
        'SCOPUS',
        '',
        '116',
        'approved',
        '2023-12-08',
        1,
        '116'
      )
    `);

    return NextResponse.json({
      success: true,
      message: "Successfully added missing publication for faculty ID 116",
      result,
    });
  } catch (error) {
    console.error("Error fixing faculty publication:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fix faculty publication",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
