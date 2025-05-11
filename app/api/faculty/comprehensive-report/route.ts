import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { RowDataPacket } from "mysql2";
import { RowInput, UserOptions } from "jspdf-autotable";

// Extend jsPDF with autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}

interface FacultyProfile {
  F_id: string;
  F_name: string;
  F_dept: string;
  Email: string | null;
  Phone_Number: string | null;
  Current_Designation: string | null;
  Highest_Degree: string | null;
  Experience: number | null;
  Date_of_Joining: string | null;
}

interface Publication {
  id: number;
  title: string;
  authors: string;
  journal_name: string;
  publication_date: string;
  doi: string | null;
}

interface ResearchProject {
  id: number;
  title: string;
  funding_agency: string;
  amount: string;
  duration: string;
  start_date: string;
  end_date: string;
}

interface Workshop {
  id: number;
  title: string;
  venue: string;
  type: string;
  start_date: string;
  end_date: string;
}

interface Award {
  id: number;
  title: string;
  awarding_organization: string;
  date: string;
}

interface Membership {
  id: number;
  organization: string;
  membership_type: string;
  start_date: string;
}

interface Contribution {
  id: number;
  type: string;
  title: string;
  date: string;
  details: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get faculty ID either from query parameter or from session
    let facultyId = request.nextUrl.searchParams.get("facultyId");
    if (!facultyId) {
      // Make a request to get the current user's faculty info
      const authResponse = await fetch(
        `${request.nextUrl.origin}/api/auth/me`,
        {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        }
      );

      if (authResponse.ok) {
        const authData = await authResponse.json();
        if (authData.success && authData.user) {
          // Try to get faculty ID from user data
          const userFacultyResponse = await fetch(
            `${request.nextUrl.origin}/api/faculty/me`,
            {
              headers: {
                cookie: request.headers.get("cookie") || "",
              },
            }
          );

          if (userFacultyResponse.ok) {
            const userFacultyData = await userFacultyResponse.json();
            if (userFacultyData.success && userFacultyData.faculty) {
              facultyId = userFacultyData.faculty.F_id.toString();
            }
          }
        }
      }
    }

    if (!facultyId) {
      return NextResponse.json(
        { success: false, message: "Faculty ID is required" },
        { status: 400 }
      );
    }

    // 1. Get faculty profile information
    const faculty = await getFacultyProfile(facultyId);
    if (!faculty) {
      return NextResponse.json(
        { success: false, message: "Faculty not found" },
        { status: 404 }
      );
    }

    // 2. Get faculty publications
    const publications = await getPublications(facultyId);

    // 3. Get faculty research projects
    const researchProjects = await getResearchProjects(facultyId);

    // 4. Get faculty workshops
    const workshops = await getWorkshops(facultyId);

    // 5. Get faculty awards
    const awards = await getAwards(facultyId);

    // 6. Get faculty memberships
    const memberships = await getMemberships(facultyId);

    // 7. Get other contributions
    const contributions = await getContributions(facultyId);

    // Generate the PDF document
    const [pdfDoc, filename] = await generateComprehensiveReport(
      faculty,
      publications,
      researchProjects,
      workshops,
      awards,
      memberships,
      contributions
    );

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer"));

    // Encode as base64
    const base64PDF = pdfBuffer.toString("base64");

    return NextResponse.json({
      success: true,
      message: "Comprehensive faculty report generated successfully",
      data: {
        facultyName: faculty.F_name,
        facultyId,
        generatedAt: new Date().toISOString(),
        filename,
        pdfBase64: base64PDF,
        tableData: {
          publications,
          researchProjects,
          workshops,
          awards,
          memberships,
          contributions,
        },
        columns: {
          publications: [
            "id",
            "title",
            "authors",
            "journal_name",
            "publication_date",
            "doi",
          ],
          researchProjects: [
            "id",
            "title",
            "funding_agency",
            "amount",
            "duration",
            "start_date",
            "end_date",
          ],
          workshops: ["id", "title", "venue", "type", "start_date", "end_date"],
          awards: ["id", "title", "awarding_organization", "date"],
          memberships: ["id", "organization", "membership_type", "start_date"],
          contributions: ["id", "type", "title", "date", "details"],
        },
      },
    });
  } catch (error) {
    console.error("Error generating faculty report:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate faculty report",
      },
      { status: 500 }
    );
  }
}

async function getFacultyProfile(
  facultyId: string
): Promise<FacultyProfile | null> {
  const facultyQuery = `
    SELECT 
      f.F_id,
      f.F_name,
      IFNULL(f.F_dept, 'Not Specified') as F_dept,
      fd.Email,
      fd.Phone_Number,
      fd.Current_Designation,
      fd.Highest_Degree,
      fd.Experience,
      fd.Date_of_Joining
    FROM 
      faculty f
    LEFT JOIN 
      faculty_details fd ON f.F_id = fd.F_ID
    WHERE 
      f.F_id = ?
  `;

  const result = (await query(facultyQuery, [facultyId])) as RowDataPacket[];

  if (!result || !Array.isArray(result) || result.length === 0) {
    return null;
  }

  // Ensure all fields have at least a default value to prevent null errors
  const profile = result[0] as FacultyProfile;
  return {
    F_id: profile.F_id,
    F_name: profile.F_name || "Unknown Faculty",
    F_dept: profile.F_dept || "Not Specified",
    Email: profile.Email || "Not Available",
    Phone_Number: profile.Phone_Number || "Not Available",
    Current_Designation: profile.Current_Designation || "Not Specified",
    Highest_Degree: profile.Highest_Degree || "Not Specified",
    Experience: profile.Experience || 0,
    Date_of_Joining: profile.Date_of_Joining || null,
  };
}

async function getPublications(facultyId: string): Promise<Publication[]> {
  try {
    // Combine all publications from various tables
    let allPublications: Publication[] = [];

    // Get publications from bookschapter table
    const bookschapterQuery = `
      SELECT 
        id,
        Title_Of_The_Book_Published as title,
        Name_Of_The_Teacher as authors,
        Name_Of_The_Publisher as journal_name,
        STR_TO_DATE(CONCAT(Year_Of_Publication, '-01-01'), '%Y-%m-%d') as publication_date,
        ISBN_Or_ISSN_Number as doi
      FROM 
        bookschapter
      WHERE 
        user_id = ? AND STATUS = 'approved'
      ORDER BY 
        Year_Of_Publication DESC
    `;

    try {
      const booksResult = (await query(bookschapterQuery, [
        facultyId,
      ])) as RowDataPacket[];

      if (booksResult && Array.isArray(booksResult) && booksResult.length > 0) {
        allPublications = [...allPublications, ...booksResult];
      }
    } catch (error) {
      console.error("Error fetching from bookschapter table:", error);
    }

    // Get publications from conference_publications table
    const conferenceQuery = `
      SELECT 
        id,
        Title_Of_The_Paper as title,
        Name_Of_The_Teacher as authors,
        Name_Of_The_Conference as journal_name,
        publication_date,
        doi
      FROM 
        conference_publications
      WHERE 
        user_id = ? AND STATUS = 'approved'
      ORDER BY 
        Year_Of_Publication DESC
    `;

    try {
      const conferenceResult = (await query(conferenceQuery, [
        facultyId,
      ])) as RowDataPacket[];

      if (
        conferenceResult &&
        Array.isArray(conferenceResult) &&
        conferenceResult.length > 0
      ) {
        allPublications = [...allPublications, ...conferenceResult];
      }
    } catch (error) {
      console.error(
        "Error fetching from conference_publications table:",
        error
      );
    }

    // Get publications from faculty_contributions table
    const contribQuery = `
      SELECT 
        Contribution_ID as id,
        Description as title,
        '' as authors,
        Recognized_By as journal_name,
        Contribution_Date as publication_date,
        Award_Received as doi
      FROM 
        faculty_contributions
      WHERE 
        F_ID = ? AND 
        (
          Contribution_Type LIKE '%publication%' OR 
          Contribution_Type LIKE '%journal%' OR 
          Contribution_Type LIKE '%conference%' OR 
          Contribution_Type LIKE '%paper%' OR
          Contribution_Type LIKE '%book%'
        )
      ORDER BY 
        Contribution_Date DESC
    `;

    try {
      const contribsResult = (await query(contribQuery, [
        facultyId,
      ])) as RowDataPacket[];

      if (
        contribsResult &&
        Array.isArray(contribsResult) &&
        contribsResult.length > 0
      ) {
        allPublications = [...allPublications, ...contribsResult];
      }
    } catch (error) {
      console.error("Error fetching from faculty_contributions table:", error);
    } // Get publications from faculty_publications table
    const publicationsQuery = `
      SELECT 
        id,
        title,
        authors,
        publication_venue as journal_name,
        publication_date,
        doi
      FROM 
        faculty_publications
      WHERE 
        faculty_id = ?
      ORDER BY 
        publication_date DESC
    `;

    try {
      const publicationsResult = (await query(publicationsQuery, [
        facultyId,
      ])) as RowDataPacket[];

      if (
        publicationsResult &&
        Array.isArray(publicationsResult) &&
        publicationsResult.length > 0
      ) {
        allPublications = [...allPublications, ...publicationsResult];
      }
    } catch (error) {
      console.error("Error fetching from faculty_publications table:", error);
    }

    // Get publications from paper_publication table (if exists)
    try {
      const paperPublicationsQuery = `
        SELECT 
          id,
          title as title,
          authors,
          journal_name,
          publication_date,
          doi
        FROM 
          paper_publication
        WHERE 
          id = ?
        ORDER BY 
          publication_date DESC
      `;

      const paperResult = (await query(paperPublicationsQuery, [
        facultyId,
      ])) as RowDataPacket[];

      if (paperResult && Array.isArray(paperResult) && paperResult.length > 0) {
        allPublications = [...allPublications, ...paperResult];
      }
    } catch (error) {
      // This table might not exist, so we'll just log and continue
      console.error("Error fetching from paper_publication table:", error);
    }

    return allPublications;
  } catch (error) {
    console.error("Error fetching publications:", error);
    return [];
  }
}

async function getResearchProjects(
  facultyId: string
): Promise<ResearchProject[]> {
  try {
    // Skip faculty_research_projects table check since it doesn't exist
    // Try contributions instead
    const contribQuery = `
      SELECT 
        Contribution_ID as id,
        Description as title,
        Recognized_By as funding_agency,
        '' as amount,
        '' as duration,
        Contribution_Date as start_date,
        Contribution_Date as end_date
      FROM 
        faculty_contributions
      WHERE 
        F_ID = ? AND 
        (
          Contribution_Type LIKE '%project%' OR 
          Contribution_Type LIKE '%research%'
        )
      ORDER BY 
        Contribution_Date DESC
    `;

    const contribsResult = (await query(contribQuery, [
      facultyId,
    ])) as RowDataPacket[];

    if (contribsResult && Array.isArray(contribsResult)) {
      return contribsResult as ResearchProject[];
    }

    return [];
  } catch (error) {
    console.error("Error fetching research projects:", error);
    return [];
  }
}

async function getWorkshops(facultyId: string): Promise<Workshop[]> {
  try {
    // Skip faculty_workshops table check since it doesn't exist
    // Try contributions instead
    const contribQuery = `
      SELECT 
        Contribution_ID as id,
        Description as title,
        Recognized_By as venue,
        Contribution_Type as type,
        Contribution_Date as start_date,
        Contribution_Date as end_date
      FROM 
        faculty_contributions
      WHERE 
        F_ID = ? AND 
        (
          Contribution_Type LIKE '%workshop%' OR 
          Contribution_Type LIKE '%seminar%' OR 
          Contribution_Type LIKE '%conference%' OR
          Contribution_Type LIKE '%training%'
        )
      ORDER BY 
        Contribution_Date DESC
    `;

    const contribsResult = (await query(contribQuery, [
      facultyId,
    ])) as RowDataPacket[];

    if (contribsResult && Array.isArray(contribsResult)) {
      return contribsResult as Workshop[];
    }

    return [];
  } catch (error) {
    console.error("Error fetching workshops:", error);
    return [];
  }
}

async function getAwards(facultyId: string): Promise<Award[]> {
  try {
    // Skip faculty_awards table since it doesn't have id field
    // Try contributions instead
    const contribQuery = `
      SELECT 
        Contribution_ID as id,
        Description as title,
        Recognized_By as awarding_organization,
        Contribution_Date as date
      FROM 
        faculty_contributions
      WHERE 
        F_ID = ? AND 
        (
          Contribution_Type LIKE '%award%' OR 
          Contribution_Type LIKE '%achievement%' OR 
          Contribution_Type LIKE '%recognition%'
        )
      ORDER BY 
        Contribution_Date DESC
    `;

    const contribsResult = (await query(contribQuery, [
      facultyId,
    ])) as RowDataPacket[];

    if (contribsResult && Array.isArray(contribsResult)) {
      return contribsResult as Award[];
    }

    return [];
  } catch (error) {
    console.error("Error fetching awards:", error);
    return [];
  }
}

async function getMemberships(facultyId: string): Promise<Membership[]> {
  try {
    // Skip professional body table check since it doesn't have Membership_Type field
    // Try memberships table
    const membershipQuery = `
      SELECT 
        membership_id as id,
        organization,
        IFNULL(membership_type, 'Member') as membership_type,
        start_date
      FROM 
        faculty_memberships
      WHERE 
        faculty_id = ?
      ORDER BY 
        start_date DESC
    `;

    const membershipResult = (await query(membershipQuery, [
      facultyId,
    ])) as RowDataPacket[];

    if (
      membershipResult &&
      Array.isArray(membershipResult) &&
      membershipResult.length > 0
    ) {
      return membershipResult as Membership[];
    } // If still no results, try contributions
    const contribQuery = `
      SELECT 
        Contribution_ID as id,
        IFNULL(Recognized_By, 'Unknown Organization') as organization,
        IFNULL(Contribution_Type, 'Membership') as membership_type,
        Contribution_Date as start_date
      FROM 
        faculty_contributions
      WHERE 
        F_ID = ? AND 
        (
          Contribution_Type LIKE '%member%' OR 
          Contribution_Type LIKE '%association%' OR
          Contribution_Type LIKE '%society%' OR
          Contribution_Type LIKE '%body%'
        )
      ORDER BY 
        Contribution_Date DESC
    `;

    const contribsResult = (await query(contribQuery, [
      facultyId,
    ])) as RowDataPacket[];

    if (contribsResult && Array.isArray(contribsResult)) {
      return contribsResult as Membership[];
    }

    return [];
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return [];
  }
}

async function getContributions(facultyId: string): Promise<Contribution[]> {
  try {
    const contribQuery = `
      SELECT 
        Contribution_ID as id,
        Contribution_Type as type,
        Description as title,
        Contribution_Date as date,
        CONCAT(
          IFNULL(Recognized_By, ''), 
          IFNULL(CONCAT(' ', Award_Received), ''),
          IFNULL(CONCAT(' ', Remarks), '')
        ) as details
      FROM 
        faculty_contributions
      WHERE 
        F_ID = ? AND 
        Contribution_Type NOT LIKE '%publication%' AND
        Contribution_Type NOT LIKE '%journal%' AND
        Contribution_Type NOT LIKE '%conference%' AND
        Contribution_Type NOT LIKE '%paper%' AND
        Contribution_Type NOT LIKE '%book%' AND
        Contribution_Type NOT LIKE '%project%' AND
        Contribution_Type NOT LIKE '%research%' AND
        Contribution_Type NOT LIKE '%workshop%' AND
        Contribution_Type NOT LIKE '%seminar%' AND
        Contribution_Type NOT LIKE '%training%' AND
        Contribution_Type NOT LIKE '%award%' AND
        Contribution_Type NOT LIKE '%achievement%' AND
        Contribution_Type NOT LIKE '%recognition%' AND
        Contribution_Type NOT LIKE '%member%' AND
        Contribution_Type NOT LIKE '%association%' AND
        Contribution_Type NOT LIKE '%society%' AND
        Contribution_Type NOT LIKE '%body%'
      ORDER BY 
        Contribution_Date DESC
    `;

    const result = (await query(contribQuery, [facultyId])) as RowDataPacket[];

    if (result && Array.isArray(result)) {
      return result as Contribution[];
    }

    return [];
  } catch (error) {
    console.error("Error fetching other contributions:", error);
    return [];
  }
}

async function generateComprehensiveReport(
  faculty: FacultyProfile,
  publications: Publication[],
  researchProjects: ResearchProject[],
  workshops: Workshop[],
  awards: Award[],
  memberships: Membership[],
  contributions: Contribution[]
): Promise<[jsPDF, string]> {
  const doc = new jsPDF();
  const filename = `faculty_comprehensive_profile_${faculty.F_id}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  // Set title and document properties
  doc.setProperties({
    title: `Comprehensive Profile of ${faculty.F_name}`,
    subject: `Faculty Profile - ${faculty.F_dept}`,
    author: "IMS Hindavi 3 System",
    creator: "IMS Hindavi 3 System",
  });

  // Add header with faculty name and designation
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Faculty Comprehensive Profile",
    doc.internal.pageSize.width / 2,
    20,
    {
      align: "center",
    }
  );

  doc.setFontSize(18);
  doc.text(faculty.F_name, doc.internal.pageSize.width / 2, 30, {
    align: "center",
  });

  if (faculty.Current_Designation) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(faculty.Current_Designation, doc.internal.pageSize.width / 2, 38, {
      align: "center",
    });
  }

  doc.setFontSize(12);
  doc.text(faculty.F_dept, doc.internal.pageSize.width / 2, 44, {
    align: "center",
  });

  let yPos = 55;

  // Personal Information
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Personal Information", 14, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  if (faculty.Email) {
    doc.text(`Email: ${faculty.Email}`, 14, yPos);
    yPos += 6;
  }

  if (faculty.Phone_Number) {
    doc.text(`Phone: ${faculty.Phone_Number}`, 14, yPos);
    yPos += 6;
  }

  if (faculty.Highest_Degree) {
    doc.text(`Highest Qualification: ${faculty.Highest_Degree}`, 14, yPos);
    yPos += 6;
  }

  if (faculty.Experience) {
    doc.text(`Experience: ${faculty.Experience} years`, 14, yPos);
    yPos += 6;
  }

  if (faculty.Date_of_Joining) {
    const joinDate = new Date(faculty.Date_of_Joining);
    doc.text(
      `Date of Joining: ${joinDate.toLocaleDateString("en-IN")}`,
      14,
      yPos
    );
    yPos += 10;
  }

  // Publications
  if (publications.length > 0) {
    yPos += 5;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Publications", 14, yPos);
    yPos += 8;

    const pubData = publications.map((pub, index) => [
      index + 1,
      pub.title,
      pub.journal_name || "N/A",
      pub.publication_date
        ? new Date(pub.publication_date).getFullYear().toString()
        : "N/A",
      pub.doi || "N/A",
    ]) as RowInput[];

    autoTable(doc, {
      head: [["#", "Title", "Journal/Publisher", "Year", "DOI/ISBN"]],
      body: pubData,
      startY: yPos,
      theme: "grid",
      headStyles: { fillColor: [75, 70, 229], textColor: 255 },
      styles: { overflow: "linebreak", cellWidth: "auto" },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 70 },
        2: { cellWidth: 40 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Research Projects
  if (researchProjects.length > 0) {
    // Check if we need to add a new page
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Research Projects", 14, yPos);
    yPos += 8;

    const projectData = researchProjects.map((proj, index) => [
      index + 1,
      proj.title,
      proj.funding_agency || "N/A",
      proj.amount || "N/A",
      proj.start_date
        ? new Date(proj.start_date).toLocaleDateString("en-IN")
        : "N/A",
      proj.end_date
        ? new Date(proj.end_date).toLocaleDateString("en-IN")
        : "N/A",
    ]) as RowInput[];

    autoTable(doc, {
      head: [
        ["#", "Title", "Funding Agency", "Amount", "Start Date", "End Date"],
      ],
      body: projectData,
      startY: yPos,
      theme: "grid",
      headStyles: { fillColor: [75, 70, 229], textColor: 255 },
      styles: { overflow: "linebreak", cellWidth: "auto" },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 70 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 23 },
        5: { cellWidth: 23 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Workshops and Trainings
  if (workshops.length > 0) {
    // Check if we need to add a new page
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Workshops and Trainings", 14, yPos);
    yPos += 8;

    const workshopData = workshops.map((ws, index) => [
      index + 1,
      ws.title,
      ws.venue || "N/A",
      ws.type || "N/A",
      ws.start_date
        ? new Date(ws.start_date).toLocaleDateString("en-IN")
        : "N/A",
      ws.end_date ? new Date(ws.end_date).toLocaleDateString("en-IN") : "N/A",
    ]) as RowInput[];

    autoTable(doc, {
      head: [["#", "Title", "Venue", "Type", "Start Date", "End Date"]],
      body: workshopData,
      startY: yPos,
      theme: "grid",
      headStyles: { fillColor: [75, 70, 229], textColor: 255 },
      styles: { overflow: "linebreak", cellWidth: "auto" },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 70 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 23 },
        5: { cellWidth: 23 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Awards and Recognitions
  if (awards.length > 0) {
    // Check if we need to add a new page
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Awards and Recognitions", 14, yPos);
    yPos += 8;

    const awardData = awards.map((award, index) => [
      index + 1,
      award.title,
      award.awarding_organization || "N/A",
      award.date ? new Date(award.date).toLocaleDateString("en-IN") : "N/A",
    ]) as RowInput[];

    autoTable(doc, {
      head: [["#", "Title", "Awarding Organization", "Date"]],
      body: awardData,
      startY: yPos,
      theme: "grid",
      headStyles: { fillColor: [75, 70, 229], textColor: 255 },
      styles: { overflow: "linebreak", cellWidth: "auto" },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 80 },
        2: { cellWidth: 60 },
        3: { cellWidth: 25 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Professional Memberships
  if (memberships.length > 0) {
    // Check if we need to add a new page
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Professional Memberships", 14, yPos);
    yPos += 8;

    const membershipData = memberships.map((mem, index) => [
      index + 1,
      mem.organization,
      mem.membership_type || "Member",
      mem.start_date
        ? new Date(mem.start_date).toLocaleDateString("en-IN")
        : "N/A",
    ]) as RowInput[];

    autoTable(doc, {
      head: [["#", "Organization", "Type", "Start Date"]],
      body: membershipData,
      startY: yPos,
      theme: "grid",
      headStyles: { fillColor: [75, 70, 229], textColor: 255 },
      styles: { overflow: "linebreak", cellWidth: "auto" },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 80 },
        2: { cellWidth: 50 },
        3: { cellWidth: 35 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Other Contributions
  if (contributions.length > 0) {
    // Check if we need to add a new page
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Other Contributions", 14, yPos);
    yPos += 8;

    const contributionData = contributions.map((contrib, index) => [
      index + 1,
      contrib.type || "Contribution",
      contrib.title,
      contrib.date ? new Date(contrib.date).toLocaleDateString("en-IN") : "N/A",
      contrib.details || "N/A",
    ]) as RowInput[];

    autoTable(doc, {
      head: [["#", "Type", "Title", "Date", "Details"]],
      body: contributionData,
      startY: yPos,
      theme: "grid",
      headStyles: { fillColor: [75, 70, 229], textColor: 255 },
      styles: { overflow: "linebreak", cellWidth: "auto" },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 60 },
        3: { cellWidth: 25 },
        4: { cellWidth: 50 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Add footer with page numbers
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );

    // Add generation date at the bottom of each page
    const today = new Date().toLocaleDateString("en-IN");
    doc.text(
      `Generated on: ${today}`,
      doc.internal.pageSize.width - 14,
      doc.internal.pageSize.height - 10,
      { align: "right" }
    );
  }

  return [doc, filename];
}
