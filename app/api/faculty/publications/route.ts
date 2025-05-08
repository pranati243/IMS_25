import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    // Get user info from auth system
    const authResponse = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!authResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();

    if (!authData.success || !authData.user) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get faculty ID from username if user is faculty
    const username = authData.user.username;
    let facultyId = null;

    if (authData.user.role === "faculty") {
      // Get faculty ID for the logged-in user
      const facultyResult = (await query(
        "SELECT F_id FROM faculty WHERE F_id = ?",
        [username]
      )) as RowDataPacket[];

      if (
        !facultyResult ||
        !Array.isArray(facultyResult) ||
        facultyResult.length === 0
      ) {
        return NextResponse.json(
          { success: false, message: "Faculty record not found" },
          { status: 404 }
        );
      }

      facultyId = facultyResult[0].F_id;
    }

    // For admin or HOD roles, allow querying for any faculty
    const queryFacultyId =
      request.nextUrl.searchParams.get("facultyId") || facultyId;

    if (!queryFacultyId) {
      return NextResponse.json(
        { success: false, message: "Faculty ID is required" },
        { status: 400 }
      );
    }

    // Check if table exists and fetch publications
    try {
      // First, try to create the faculty_publications table if it doesn't exist
      await query(`CREATE TABLE IF NOT EXISTS faculty_publications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_id BIGINT NOT NULL,
        title VARCHAR(500) NOT NULL,
        abstract TEXT,
        authors VARCHAR(500) NOT NULL,
        publication_date DATE NOT NULL,
        publication_type ENUM('journal', 'conference', 'book', 'book_chapter', 'other') NOT NULL,
        publication_venue VARCHAR(500) NOT NULL,
        doi VARCHAR(100),
        url VARCHAR(1000),
        citation_count INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (faculty_id),
        CONSTRAINT fk_faculty_publications_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(F_id)
      )`);

      // Fetch publications from the proper table with the right field names
      const publications = (await query(
        `SELECT 
          id,
          faculty_id,
          title,
          abstract,
          authors,
          publication_date,
          publication_type,
          publication_venue,
          doi,
          url,
          citation_count
        FROM 
          faculty_publications
        WHERE 
          faculty_id = ?
        ORDER BY 
          publication_date DESC`,
        [queryFacultyId]
      )) as RowDataPacket[];

      console.log(
        `Found ${publications.length} publications for faculty ID ${queryFacultyId}`
      );

      // Return the publications data
      return NextResponse.json({
        success: true,
        data: publications,
      });
    } catch (error) {
      console.error(
        "Error checking/querying faculty_publications table:",
        error
      );
      return NextResponse.json({
        success: true,
        data: [],
        error: "Database error when fetching publications",
      });
    }
  } catch (error) {
    console.error("Error fetching faculty publications:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch publications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user info from auth system
    const authResponse = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!authResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();

    if (!authData.success || !authData.user) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Only faculty, HOD, and admin can add publications
    if (!["faculty", "hod", "admin"].includes(authData.user.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to add publications" },
        { status: 403 }
      );
    }

    // Get faculty ID from username if user is faculty
    const username = authData.user.username;
    let facultyId = null;

    if (authData.user.role === "faculty") {
      // Get faculty ID for the logged-in user
      const facultyResult = (await query(
        "SELECT F_id FROM faculty WHERE F_id = ?",
        [username]
      )) as RowDataPacket[];

      if (
        !facultyResult ||
        !Array.isArray(facultyResult) ||
        facultyResult.length === 0
      ) {
        return NextResponse.json(
          { success: false, message: "Faculty record not found" },
          { status: 404 }
        );
      }

      facultyId = facultyResult[0].F_id;
    }

    // Parse request body
    const {
      title,
      abstract,
      authors,
      publication_date,
      publication_type,
      publication_venue,
      doi,
      url,
      citation_count,
      faculty_id: requestFacultyId,
    } = await request.json();

    // For faculty role, ensure they can only add their own publications
    const publicationFacultyId =
      authData.user.role === "faculty" ? facultyId : requestFacultyId;

    if (!publicationFacultyId) {
      return NextResponse.json(
        { success: false, message: "Faculty ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (
      !title ||
      !authors ||
      !publication_date ||
      !publication_type ||
      !publication_venue
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, authors, publication date, type, and venue are required",
        },
        { status: 400 }
      );
    }

    // Create the table if it doesn't exist
    await query(`CREATE TABLE IF NOT EXISTS faculty_publications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      faculty_id BIGINT NOT NULL,
      title VARCHAR(500) NOT NULL,
      abstract TEXT,
      authors VARCHAR(500) NOT NULL,
      publication_date DATE NOT NULL,
      publication_type ENUM('journal', 'conference', 'book', 'book_chapter', 'other') NOT NULL,
      publication_venue VARCHAR(500) NOT NULL,
      doi VARCHAR(100),
      url VARCHAR(1000),
      citation_count INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX (faculty_id),
      CONSTRAINT fk_faculty_publications_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(F_id)
    )`);

    // Insert the publication
    const result = await query(
      `INSERT INTO faculty_publications 
        (faculty_id, title, abstract, authors, publication_date, publication_type, publication_venue, doi, url, citation_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        publicationFacultyId,
        title,
        abstract || null,
        authors,
        publication_date,
        publication_type,
        publication_venue,
        doi || null,
        url || null,
        citation_count || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Publication added successfully",
      data: {
        id: (result as any).insertId,
        faculty_id: publicationFacultyId,
        title,
        abstract,
        authors,
        publication_date,
        publication_type,
        publication_venue,
        doi,
        url,
        citation_count,
      },
    });
  } catch (error) {
    console.error("Error adding publication:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add publication" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user info from auth system
    const authResponse = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!authResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();

    if (!authData.success || !authData.user) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Only faculty, HOD, and admin can update publications
    if (!["faculty", "hod", "admin"].includes(authData.user.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update publications" },
        { status: 403 }
      );
    }

    // Parse request body
    const {
      id,
      title,
      abstract,
      authors,
      publication_date,
      publication_type,
      publication_venue,
      doi,
      url,
      citation_count,
      faculty_id: requestFacultyId,
    } = await request.json();

    // Check if ID is provided
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Publication ID is required" },
        { status: 400 }
      );
    }

    // Get faculty ID from username if user is faculty
    const username = authData.user.username;
    let facultyId = null;

    if (authData.user.role === "faculty") {
      // Get faculty ID for the logged-in user
      const facultyResult = (await query(
        "SELECT F_id FROM faculty WHERE F_id = ?",
        [username]
      )) as RowDataPacket[];

      if (
        !facultyResult ||
        !Array.isArray(facultyResult) ||
        facultyResult.length === 0
      ) {
        return NextResponse.json(
          { success: false, message: "Faculty record not found" },
          { status: 404 }
        );
      }

      facultyId = facultyResult[0].F_id;
    }

    // If the user is a faculty member, verify they can only update their own publications
    if (authData.user.role === "faculty") {
      const publicationCheck = (await query(
        "SELECT faculty_id FROM faculty_publications WHERE id = ?",
        [id]
      )) as RowDataPacket[];

      if (
        !publicationCheck ||
        !Array.isArray(publicationCheck) ||
        publicationCheck.length === 0
      ) {
        return NextResponse.json(
          { success: false, message: "Publication not found" },
          { status: 404 }
        );
      }

      if (publicationCheck[0].faculty_id !== facultyId) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized to update this publication",
          },
          { status: 403 }
        );
      }
    }

    // Validate required fields
    if (
      !title ||
      !authors ||
      !publication_date ||
      !publication_type ||
      !publication_venue
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Title, authors, publication date, type, and venue are required",
        },
        { status: 400 }
      );
    }

    // For admin/HOD, respect the provided faculty_id, for faculty, use their own ID
    const publicationFacultyId =
      authData.user.role === "faculty"
        ? facultyId
        : requestFacultyId || facultyId;

    // Update the publication
    await query(
      `UPDATE faculty_publications 
       SET 
        title = ?,
        abstract = ?,
        authors = ?,
        publication_date = ?,
        publication_type = ?,
        publication_venue = ?,
        doi = ?,
        url = ?,
        citation_count = ?,
        faculty_id = ?
       WHERE id = ?`,
      [
        title,
        abstract || null,
        authors,
        publication_date,
        publication_type,
        publication_venue,
        doi || null,
        url || null,
        citation_count || null,
        publicationFacultyId,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Publication updated successfully",
      data: {
        id,
        faculty_id: publicationFacultyId,
        title,
        abstract,
        authors,
        publication_date,
        publication_type,
        publication_venue,
        doi,
        url,
        citation_count,
      },
    });
  } catch (error) {
    console.error("Error updating publication:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update publication" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user info from auth system
    const authResponse = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!authResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 401 }
      );
    }

    const authData = await authResponse.json();

    if (!authData.success || !authData.user) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Only faculty, HOD, and admin can delete publications
    if (!["faculty", "hod", "admin"].includes(authData.user.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to delete publications" },
        { status: 403 }
      );
    }

    // Get the ID from the query parameters
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Publication ID is required" },
        { status: 400 }
      );
    }

    // Get faculty ID from username if user is faculty
    const username = authData.user.username;
    let facultyId = null;

    if (authData.user.role === "faculty") {
      // Get faculty ID for the logged-in user
      const facultyResult = (await query(
        "SELECT F_id FROM faculty WHERE F_id = ?",
        [username]
      )) as RowDataPacket[];

      if (
        !facultyResult ||
        !Array.isArray(facultyResult) ||
        facultyResult.length === 0
      ) {
        return NextResponse.json(
          { success: false, message: "Faculty record not found" },
          { status: 404 }
        );
      }

      facultyId = facultyResult[0].F_id;

      // If the user is a faculty member, verify they can only delete their own publications
      const publicationCheck = (await query(
        "SELECT faculty_id FROM faculty_publications WHERE id = ?",
        [id]
      )) as RowDataPacket[];

      if (
        !publicationCheck ||
        !Array.isArray(publicationCheck) ||
        publicationCheck.length === 0
      ) {
        return NextResponse.json(
          { success: false, message: "Publication not found" },
          { status: 404 }
        );
      }

      if (publicationCheck[0].faculty_id !== facultyId) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized to delete this publication",
          },
          { status: 403 }
        );
      }
    }

    // Delete the publication
    await query("DELETE FROM faculty_publications WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Publication deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting publication:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete publication" },
      { status: 500 }
    );
  }
}
