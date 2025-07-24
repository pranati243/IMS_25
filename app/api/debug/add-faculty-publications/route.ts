import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Make sure this endpoint is only accessible in development
    //if (process.env.NODE_ENV === "production") {
      //return NextResponse.json(
        //{ success: false, message: "Not available in production" },
        //{ status: 403 }
      //);
    //}

    // Create the table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS faculty_publications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_id VARCHAR(50) NOT NULL,
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
      )
    `);

    // Check if Smita Dange exists in the faculty table
    const facultyId = "SDANGE";
    const facultyCheck = await query(
      "SELECT F_id FROM faculty WHERE F_id = ?",
      [facultyId]
    );

    if (!facultyCheck || (facultyCheck as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        message: `Faculty member with ID ${facultyId} not found`,
      });
    }

    // Add sample publications for Smita Dange
    const samplePublications = [
      {
        title:
          "Machine Learning Approaches for Predictive Analysis in Education",
        abstract:
          "This paper explores various machine learning techniques to predict student performance in higher education.",
        authors: "Smita Dange, Rohit Sharma, Priya Patel",
        publication_date: "2023-08-15",
        publication_type: "journal",
        publication_venue: "International Journal of Educational Technology",
        doi: "10.1234/ijet.2023.0125",
        url: "https://example.com/publication1",
        citation_count: 12,
      },
      {
        title: "Blockchain Applications in Academic Record Verification",
        abstract:
          "A novel approach to verify academic credentials using blockchain technology.",
        authors: "Smita Dange, Amit Kumar",
        publication_date: "2022-06-22",
        publication_type: "conference",
        publication_venue: "IEEE Conference on Educational Technology",
        doi: "10.5678/icet.2022.045",
        url: "https://example.com/publication2",
        citation_count: 8,
      },
      {
        title: "Cybersecurity Awareness in Educational Institutions",
        abstract:
          "This study evaluates the current state of cybersecurity awareness in Indian educational institutions.",
        authors: "Smita Dange, Neha Singh, Vikram Desai",
        publication_date: "2021-11-03",
        publication_type: "journal",
        publication_venue: "Journal of Computer Security in Education",
        doi: "10.9012/jcse.2021.078",
        url: "https://example.com/publication3",
        citation_count: 15,
      },
    ];

    // Clear existing publications for this faculty member (optional - for testing purposes)
    await query("DELETE FROM faculty_publications WHERE faculty_id = ?", [
      facultyId,
    ]);

    // Insert sample publications
    for (const pub of samplePublications) {
      await query(
        `INSERT INTO faculty_publications 
          (faculty_id, title, abstract, authors, publication_date, publication_type, publication_venue, doi, url, citation_count) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          facultyId,
          pub.title,
          pub.abstract,
          pub.authors,
          pub.publication_date,
          pub.publication_type,
          pub.publication_venue,
          pub.doi,
          pub.url,
          pub.citation_count,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      message: `Added ${samplePublications.length} sample publications for faculty ID ${facultyId}`,
    });
  } catch (error) {
    console.error("Error adding sample publications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add sample publications",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
