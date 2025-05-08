import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { compare, hash } from "bcrypt";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { message: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const users = await query(
      `
      SELECT 
        u.id, u.username, u.email, u.password, u.role, u.name, u.is_active
      FROM users u
      WHERE u.email = ?
      LIMIT 1
      `,
      [email]
    );

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // For security, don't return the password hash in production
    if (process.env.NODE_ENV === "production") {
      user.password = "REDACTED";
    }

    // Check if user is active
    const isActive = user.is_active === 1;

    return NextResponse.json({
      user: {
        ...user,
        // Add debugging information
        isActive,
        passwordFormat: user.password
          ? `${user.password.substring(0, 10)}...`
          : "No password",
        loginConditions: {
          emailFound: true,
          isActive,
        },
      },
      message: "User debug information",
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { message: "Error retrieving user information", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, testPassword } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get user from database
    const users = await query(
      `
      SELECT 
        u.id, u.username, u.email, u.password, u.role, u.name, u.is_active
      FROM users u
      WHERE u.email = ?
      LIMIT 1
      `,
      [email]
    );

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Check if password matches
    const passwordMatch = await compare(password, user.password);

    // If testPassword is provided, generate a hash for it
    let testHash = null;
    if (testPassword) {
      testHash = await hash(testPassword, 10);
    }

    return NextResponse.json({
      success: passwordMatch,
      message: passwordMatch ? "Password matches" : "Password does not match",
      debug: {
        email,
        userId: user.id,
        isActive: user.is_active === 1,
        passwordLength: user.password?.length,
        testHash: testHash ? `${testHash.substring(0, 15)}...` : null,
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { message: "Error checking credentials", error: String(error) },
      { status: 500 }
    );
  }
}

// Add sample publications for testing
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const facultyId = url.searchParams.get("facultyId") || "DANG_SM";

    // Create the publications table if it doesn't exist
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

    // Sample publications data
    const samplePublications = [
      {
        title: "Advancements in Machine Learning for Educational Assessment",
        abstract:
          "This study explores the application of machine learning algorithms in educational assessment and demonstrates improved accuracy in predicting student outcomes.",
        authors: "Smita Dange, Rajesh Kumar, Priya Sharma",
        publication_date: "2024-02-15",
        publication_type: "journal",
        publication_venue: "Journal of Educational Technology",
        doi: "10.1234/jet.2024.0215",
        url: "https://example.com/jet/2024/0215",
        citation_count: 8,
      },
      {
        title: "Blockchain Technology in Academic Records Management",
        abstract:
          "A comprehensive analysis of implementing blockchain for secure and transparent academic records management in higher education institutions.",
        authors: "Smita Dange, Amit Patel",
        publication_date: "2023-10-10",
        publication_type: "conference",
        publication_venue:
          "International Conference on Educational Innovations",
        doi: "10.5678/icei.2023.1010",
        url: "https://example.com/icei/proceedings/2023",
        citation_count: 12,
      },
      {
        title: "Digital Transformation of Higher Education: A Case Study",
        abstract:
          "This book chapter examines the digital transformation journey of a prominent engineering college in India.",
        authors: "Smita Dange, Neha Gupta, Sanjay Mehta",
        publication_date: "2023-05-22",
        publication_type: "book_chapter",
        publication_venue: "Handbook of Educational Technology Implementation",
        doi: "10.9012/hetimpl.2023.ch7",
        url: "https://example.com/books/hetimpl/chapter7",
        citation_count: 5,
      },
    ];

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
      message: `Added ${samplePublications.length} sample publications for faculty ID: ${facultyId}`,
      samplePublications,
    });
  } catch (error) {
    console.error("Error adding sample publications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add sample publications",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
