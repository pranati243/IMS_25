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
  Phone_No: string | null;
  Current_Designation: string | null;
  Highest_Degree: string | null;
  Experience: number | null;
  Date_of_Joining: string | null;
  Research_Interest: string | null;
  Bio: string | null;
}

interface Publication {
  id: number;
  title: string;
  abstract: string | null;
  authors: string;
  publication_date: string;
  publication_type:
    | "journal"
    | "conference"
    | "book"
    | "book_chapter"
    | "other";
  publication_venue: string;
  doi: string | null;
  url: string | null;
  citation_count: number | null;
}

interface Award {
  award_id: number;
  award_name: string;
  awarding_organization: string;
  award_date: string;
  award_description: string | null;
}

interface Contribution {
  contribution_id: number;
  contribution_type: string;
  contribution_title: string;
  contribution_date: string;
  year: number | null;
  journal_conference: string | null;
  award: string | null;
  impact_factor: string | null;
  description: string | null;
}

interface Membership {
  membership_id: number;
  organization: string;
  membership_type: string;
  start_date: string;
  end_date: string | null;
  description: string | null;
}

export async function GET(request: NextRequest) {
  try {
    // Extract faculty ID from query parameters
    const facultyId = request.nextUrl.searchParams.get("facultyId");

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

    // 3. Get faculty awards
    const awards = await getAwards(facultyId);

    // 4. Get faculty contributions
    const contributions = await getContributions(facultyId);

    // 5. Get faculty memberships
    const memberships = await getMemberships(facultyId);

    // Generate the PDF document
    const [pdfDoc, filename] = await generateBiodata(
      faculty,
      publications,
      awards,
      contributions,
      memberships
    );

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer"));

    // Encode as base64
    const base64PDF = pdfBuffer.toString("base64");

    return NextResponse.json({
      success: true,
      message: "Biodata generated successfully",
      data: {
        facultyName: faculty.F_name,
        facultyId,
        generatedAt: new Date().toISOString(),
        filename,
        pdfBase64: base64PDF,
      },
    });
  } catch (error) {
    console.error("Error generating biodata:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to generate biodata",
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
      f.F_dept,
      fd.Email,
      fd.Phone_No,
      fd.Current_Designation,
      fd.Highest_Degree,
      fd.Experience,
      fd.Date_of_Joining,
      fd.Research_Interest,
      fd.Bio
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

  return result[0] as FacultyProfile;
}

async function getPublications(facultyId: string): Promise<Publication[]> {
  const publicationsQuery = `
    SELECT 
      id,
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
      publication_date DESC
  `;

  const result = (await query(publicationsQuery, [
    facultyId,
  ])) as RowDataPacket[];

  if (!result || !Array.isArray(result)) {
    return [];
  }

  return result as Publication[];
}

async function getAwards(facultyId: string): Promise<Award[]> {
  const awardsQuery = `
    SELECT 
      award_id,
      award_name,
      awarding_organization,
      award_date,
      award_description
    FROM 
      faculty_awards
    WHERE 
      faculty_id = ?
    ORDER BY 
      award_date DESC
  `;

  const result = (await query(awardsQuery, [facultyId])) as RowDataPacket[];

  if (!result || !Array.isArray(result)) {
    return [];
  }

  return result as Award[];
}

async function getContributions(facultyId: string): Promise<Contribution[]> {
  const contributionsQuery = `
    SELECT 
      contribution_id,
      contribution_type,
      contribution_title,
      contribution_date,
      year,
      journal_conference,
      award,
      impact_factor,
      description
    FROM 
      faculty_contributions
    WHERE 
      F_ID = ?
    ORDER BY 
      contribution_date DESC, year DESC
  `;

  const result = (await query(contributionsQuery, [
    facultyId,
  ])) as RowDataPacket[];

  if (!result || !Array.isArray(result)) {
    return [];
  }

  return result as Contribution[];
}

async function getMemberships(facultyId: string): Promise<Membership[]> {
  const membershipsQuery = `
    SELECT 
      membership_id,
      organization,
      membership_type,
      start_date,
      end_date,
      description
    FROM 
      faculty_memberships
    WHERE 
      faculty_id = ?
    ORDER BY 
      start_date DESC
  `;

  const result = (await query(membershipsQuery, [
    facultyId,
  ])) as RowDataPacket[];

  if (!result || !Array.isArray(result)) {
    return [];
  }

  return result as Membership[];
}

async function generateBiodata(
  faculty: FacultyProfile,
  publications: Publication[],
  awards: Award[],
  contributions: Contribution[],
  memberships: Membership[]
): Promise<[jsPDF, string]> {
  const doc = new jsPDF();
  const filename = `faculty_biodata_${faculty.F_id}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  // Set title and document properties
  doc.setProperties({
    title: `Biodata of ${faculty.F_name}`,
    subject: `Faculty Biodata - ${faculty.F_dept}`,
    author: "IMS Hindavi 3 System",
    creator: "IMS Hindavi 3 System",
  });

  // Add header with faculty name and designation
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(faculty.F_name, doc.internal.pageSize.width / 2, 20, {
    align: "center",
  });

  if (faculty.Current_Designation) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(faculty.Current_Designation, doc.internal.pageSize.width / 2, 30, {
      align: "center",
    });
  }

  doc.setFontSize(12);
  doc.text(faculty.F_dept, doc.internal.pageSize.width / 2, 38, {
    align: "center",
  });

  let yPos = 50;

  // Contact Information
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Contact Information", 14, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  if (faculty.Email) {
    doc.text(`Email: ${faculty.Email}`, 14, yPos);
    yPos += 6;
  }

  if (faculty.Phone_No) {
    doc.text(`Phone: ${faculty.Phone_No}`, 14, yPos);
    yPos += 6;
  }

  // Academic Details
  yPos += 6;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Academic Information", 14, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

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
    yPos += 6;
  }

  // Research Interests
  if (faculty.Research_Interest) {
    yPos += 6;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Research Interests", 14, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const splitText = doc.splitTextToSize(faculty.Research_Interest, 180);
    doc.text(splitText, 14, yPos);
    yPos += splitText.length * 6 + 6;
  }

  // Bio
  if (faculty.Bio) {
    yPos += 6;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Biography", 14, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const bioSplitText = doc.splitTextToSize(faculty.Bio, 180);
    doc.text(bioSplitText, 14, yPos);
    yPos += bioSplitText.length * 6 + 6;
  }

  // Check if we need to add a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Publications
  if (publications.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Publications", doc.internal.pageSize.width / 2, yPos, {
      align: "center",
    });
    yPos += 10;

    // Group publications by type
    const journalPubs = publications.filter(
      (p) => p.publication_type === "journal"
    );
    const conferencePubs = publications.filter(
      (p) => p.publication_type === "conference"
    );
    const bookPubs = publications.filter(
      (p) =>
        p.publication_type === "book" || p.publication_type === "book_chapter"
    );
    const otherPubs = publications.filter(
      (p) => p.publication_type === "other"
    );

    let pubTypes = [
      { type: "Journal Articles", items: journalPubs },
      { type: "Conference Papers", items: conferencePubs },
      { type: "Books and Book Chapters", items: bookPubs },
      { type: "Other Publications", items: otherPubs },
    ];

    for (const pubType of pubTypes) {
      if (pubType.items.length > 0) {
        // Check if we need to add a new page
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(pubType.type, 14, yPos);
        yPos += 8;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");

        for (const pub of pubType.items) {
          const formattedDate = new Date(pub.publication_date).getFullYear();
          const citation = `${pub.authors} (${formattedDate}). ${pub.title}. ${pub.publication_venue}.`;

          const splitCitation = doc.splitTextToSize(citation, 180);

          // Check if we need a new page for this citation
          if (
            yPos + splitCitation.length * 5 + 10 >
            doc.internal.pageSize.height - 15
          ) {
            doc.addPage();
            yPos = 20;
          }

          doc.text(splitCitation, 14, yPos);
          yPos += splitCitation.length * 5;

          if (pub.doi) {
            doc.setTextColor(0, 0, 255);
            doc.text(`DOI: ${pub.doi}`, 14, yPos);
            doc.setTextColor(0, 0, 0);
          }
          yPos += 10;
        }

        yPos += 5;
      }
    }
  }

  // Awards and Honors
  if (awards.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Awards and Honors", doc.internal.pageSize.width / 2, yPos, {
      align: "center",
    });
    yPos += 15;

    const awardData = awards.map((award) => [
      award.award_name,
      award.awarding_organization,
      new Date(award.award_date).toLocaleDateString("en-IN"),
      award.award_description || "",
    ]) as RowInput[];

    autoTable(doc, {
      head: [["Award Name", "Organization", "Date", "Description"]],
      body: awardData,
      startY: yPos,
      theme: "grid",
      headStyles: { fillColor: [75, 70, 229], textColor: 255 },
      styles: { overflow: "linebreak", cellWidth: "auto" },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 70 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Professional Memberships
  if (memberships.length > 0) {
    // Check if we need to add a new page
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 10;
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Professional Memberships",
      doc.internal.pageSize.width / 2,
      yPos,
      { align: "center" }
    );
    yPos += 15;

    const membershipData = memberships.map((m) => [
      m.organization,
      m.membership_type,
      new Date(m.start_date).toLocaleDateString("en-IN"),
      m.end_date ? new Date(m.end_date).toLocaleDateString("en-IN") : "Present",
      m.description || "",
    ]) as RowInput[];

    autoTable(doc, {
      head: [["Organization", "Type", "Start Date", "End Date", "Description"]],
      body: membershipData,
      startY: yPos,
      theme: "grid",
      headStyles: { fillColor: [75, 70, 229], textColor: 255 },
      styles: { overflow: "linebreak", cellWidth: "auto" },
    });
  }

  // Other Contributions
  if (contributions.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Other Academic Contributions",
      doc.internal.pageSize.width / 2,
      yPos,
      { align: "center" }
    );
    yPos += 15;

    // Group contributions by type
    const contributionsByType = contributions.reduce((acc, curr) => {
      const type = curr.contribution_type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(curr);
      return acc;
    }, {} as Record<string, Contribution[]>);

    for (const [type, items] of Object.entries(contributionsByType)) {
      // Skip if already included in publications
      if (
        ["journal", "conference", "book", "book_chapter"].includes(
          type.toLowerCase()
        )
      ) {
        continue;
      }

      // Check if we need a new page
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");

      // Capitalize first letter of type
      const formattedType = type.charAt(0).toUpperCase() + type.slice(1);
      doc.text(formattedType, 14, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      for (const item of items) {
        const year =
          item.year || new Date(item.contribution_date).getFullYear();

        // Format the contribution entry
        const contributionText = `${item.contribution_title} (${year})${
          item.journal_conference ? `, ${item.journal_conference}` : ""
        }`;

        const splitText = doc.splitTextToSize(contributionText, 180);

        // Check if we need a new page for this item
        if (
          yPos + splitText.length * 5 + 8 >
          doc.internal.pageSize.height - 15
        ) {
          doc.addPage();
          yPos = 20;
        }

        doc.text(splitText, 14, yPos);
        yPos += splitText.length * 5;

        if (item.description) {
          const descText = doc.splitTextToSize(
            `Description: ${item.description}`,
            170
          );
          doc.text(descText, 24, yPos);
          yPos += descText.length * 5;
        }

        yPos += 6;
      }

      yPos += 6;
    }
  }

  // Add footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
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
