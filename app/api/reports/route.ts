import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { RowInput, UserOptions } from "jspdf-autotable";
import {
  getFacultyReportData,
  getStudentsReportData,
  getResearchReportData,
} from "@/app/lib/report-data";

// Extend jsPDF with autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if the request has a body before trying to parse it
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, message: "Invalid content type. Expected JSON." },
        { status: 400 }
      );
    }

    // Clone the request to read the body as text first for debugging
    const clonedRequest = request.clone();
    const rawBody = await clonedRequest.text();

    if (!rawBody || rawBody.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Empty request body" },
        { status: 400 }
      );
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError, "Raw body:", rawBody);
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { reportType, departmentId, format = "pdf" } = body;

    // If JSON format is requested, return the raw data
    if (format === "json") {
      let tableData;
      let columns;

      switch (reportType) {
        case "faculty":
          [tableData, columns] = await getFacultyReportData(departmentId);
          break;
        case "students":
          [tableData, columns] = await getStudentsReportData(departmentId);
          break;
        case "research":
          [tableData, columns] = await getResearchReportData(departmentId);
          break;
        case "full":
        default:
          // For full reports, we'll combine data
          const [facultyData] = await getFacultyReportData(departmentId);
          const [studentData] = await getStudentsReportData(departmentId);
          const [researchData] = await getResearchReportData(departmentId);
          tableData = {
            faculty: facultyData,
            students: studentData,
            research: researchData,
          };
          break;
      }

      return NextResponse.json({
        success: true,
        message: "Report data retrieved successfully",
        data: {
          reportType,
          departmentId: departmentId || "all",
          generatedAt: new Date().toISOString(),
          tableData,
          columns,
        },
      });
    }

    // Otherwise generate PDF as usual
    let pdfDoc: jsPDF;
    let filename: string;

    switch (reportType) {
      case "faculty":
        [pdfDoc, filename] = await generateFacultyReport(departmentId);
        break;
      case "students":
        [pdfDoc, filename] = await generateStudentsReport(departmentId);
        break;
      case "research":
        [pdfDoc, filename] = await generateResearchReport(departmentId);
        break;
      case "full":
      default:
        [pdfDoc, filename] = await generateFullReport(departmentId);
        break;
    }

    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer"));

    // Store the PDF in a file or database in a real implementation
    // For now, we'll encode it as base64 and return it in the response
    const base64PDF = pdfBuffer.toString("base64");

    return NextResponse.json({
      success: true,
      message: "Report generated successfully",
      data: {
        reportType,
        departmentId: departmentId || "all",
        generatedAt: new Date().toISOString(),
        filename,
        pdfBase64: base64PDF,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate report" },
      { status: 500 }
    );
  }
}

// Define interfaces for data types
interface FacultyData {
  F_id: number;
  F_name: string;
  F_dept: string;
  Email: string;
  Current_Designation: string | null;
  Highest_Degree: string | null;
  Experience: number | null;
  Date_of_Joining: string | null;
  is_hod: boolean | null;
}

interface DepartmentStats {
  Department: string;
  TotalFaculty: number;
  Professors: number;
  AssociateProfessors: number;
  AssistantProfessors: number;
}

interface ResearchItem {
  F_name: string;
  F_dept: string;
  Title: string | null;
  Type: string | null;
  Year: number | string | null;
  Journal_Conference: string | null;
}

interface ResearchStats {
  Department: string;
  TotalContributions: number;
  JournalPublications: number;
  ConferencePublications: number;
  ResearchProjects: number;
}

// Helper function to generate faculty report
async function generateFacultyReport(
  departmentId?: string
): Promise<[jsPDF, string]> {
  const doc = new jsPDF();
  const filename = `faculty_report_${departmentId || "all"}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  // Add title
  doc.setFontSize(18);
  doc.text("Faculty Report", 14, 22);

  // Add report metadata
  doc.setFontSize(11);
  doc.text(`Department: ${departmentId || "All Departments"}`, 14, 30);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);
  // Fetch faculty data
  let facultyQuery = `    SELECT 
      f.F_id,
      f.F_name,
      f.F_dept,
      fd.Email,
      fd.Current_Designation,
      fd.Highest_Degree,
      fd.Experience,
      fd.Date_of_Joining,
      fd.is_hod
    FROM faculty f
    LEFT JOIN faculty_details fd ON f.F_id = fd.F_ID
  `;

  const params: (string | number)[] = [];
  if (departmentId && departmentId !== "all") {
    facultyQuery += " WHERE f.F_dept = ?";
    params.push(departmentId);
  } // Add ORDER BY clause with hierarchical sorting
  // First priority - HOD status (using is_hod flag + departments.HOD_ID), then designation, then date of joining
  facultyQuery += `
    ORDER BY 
      CASE 
        WHEN fd.is_hod = TRUE OR f.F_id = (SELECT HOD_ID FROM departments WHERE Department_Name = f.F_dept) THEN 0
        ELSE 1
      END,
      CASE 
        WHEN fd.Current_Designation = 'Professor' THEN 1
        WHEN fd.Current_Designation = 'Associate Professor' THEN 2
        WHEN fd.Current_Designation = 'Assistant Professor' THEN 3
        ELSE 4
      END,
      fd.Date_of_Joining
  `;

  const facultyData = (await query(facultyQuery, params)) as FacultyData[];

  if (!facultyData || !Array.isArray(facultyData) || facultyData.length === 0) {
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text("No faculty data found", 14, 50);
    return [doc, filename];
  }
  // Prepare data for table
  const tableData = facultyData.map((faculty) => [
    faculty.F_name,
    faculty.F_dept,
    (faculty.is_hod ? "HoD - " : "") + (faculty.Current_Designation || "N/A"),
    faculty.Highest_Degree || "N/A",
    faculty.Experience?.toString() || "N/A",
    faculty.Date_of_Joining
      ? new Date(faculty.Date_of_Joining).toLocaleDateString()
      : "N/A",
    faculty.Email || "N/A",
  ]) as RowInput[];
  // Add table
  autoTable(doc, {
    head: [
      [
        "Name",
        "Department",
        "Designation",
        "Highest Degree",
        "Experience (Years)",
        "Date of Joining",
        "Email",
      ],
    ],
    body: tableData,
    startY: 45,
    theme: "grid",
    headStyles: { fillColor: [75, 70, 229], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 255] },
    margin: { top: 45 },
  });

  // Department-wise statistics
  doc.addPage();
  doc.setFontSize(16);
  doc.text("Faculty Statistics by Department", 14, 22);

  // Fetch department-wise statistics
  const statsQuery = `
    SELECT 
      f.F_dept AS Department,
      COUNT(*) AS TotalFaculty,
      SUM(CASE WHEN fd.Current_Designation = 'Professor' THEN 1 ELSE 0 END) AS Professors,
      SUM(CASE WHEN fd.Current_Designation = 'Associate Professor' THEN 1 ELSE 0 END) AS AssociateProfessors,
      SUM(CASE WHEN fd.Current_Designation = 'Assistant Professor' THEN 1 ELSE 0 END) AS AssistantProfessors
    FROM faculty f
    LEFT JOIN faculty_details fd ON f.F_id = fd.F_ID
    ${departmentId && departmentId !== "all" ? "WHERE f.F_dept = ?" : ""}
    GROUP BY f.F_dept
    ORDER BY f.F_dept
  `;

  const statsParams =
    departmentId && departmentId !== "all" ? [departmentId] : [];
  const statsData = (await query(statsQuery, statsParams)) as DepartmentStats[];

  if (statsData && Array.isArray(statsData) && statsData.length > 0) {
    const statsTableData = statsData.map((stat) => [
      stat.Department || "N/A",
      stat.TotalFaculty?.toString() || "0",
      stat.Professors?.toString() || "0",
      stat.AssociateProfessors?.toString() || "0",
      stat.AssistantProfessors?.toString() || "0",
    ]) as RowInput[];

    autoTable(doc, {
      head: [
        [
          "Department",
          "Total Faculty",
          "Professors",
          "Associate Professors",
          "Assistant Professors",
        ],
      ],
      body: statsTableData,
      startY: 30,
      theme: "grid",
      headStyles: { fillColor: [75, 70, 229], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 255] },
    });
  }

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      "Institute Management System - NAAC/NBA Reports",
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  return [doc, filename];
}

// Helper function to generate students report
async function generateStudentsReport(
  departmentId?: string
): Promise<[jsPDF, string]> {
  const doc = new jsPDF();
  const filename = `students_report_${departmentId || "all"}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  // Add title
  doc.setFontSize(18);
  doc.text("Students Report", 14, 22);

  // Add report metadata
  doc.setFontSize(11);
  doc.text(`Department: ${departmentId || "All Departments"}`, 14, 30);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

  // For this version, we'll just add a placeholder table since we don't have direct access to the students table structure
  doc.setFontSize(12);
  doc.text("Student enrollment statistics will be displayed here.", 14, 50);

  // Add footer
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    "Page 1 of 1",
    doc.internal.pageSize.getWidth() / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );
  doc.text(
    "Institute Management System - NAAC/NBA Reports",
    14,
    doc.internal.pageSize.getHeight() - 10
  );

  return [doc, filename];
}

// Helper function to generate research report
async function generateResearchReport(
  departmentId?: string
): Promise<[jsPDF, string]> {
  const doc = new jsPDF();
  const filename = `research_report_${departmentId || "all"}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  // Add title
  doc.setFontSize(18);
  doc.text("Research Output Report", 14, 22);

  // Add report metadata
  doc.setFontSize(11);
  doc.text(`Department: ${departmentId || "All Departments"}`, 14, 30);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

  // Fetch research data
  let researchQuery = `
    SELECT 
      f.F_name,
      f.F_dept,
      fc.Contribution_Title as Title,
      fc.Contribution_Type as Type,
      fc.Year,
      fc.Journal_Conference
    FROM faculty_contributions fc
    JOIN faculty f ON fc.F_ID = f.F_id
    WHERE fc.Contribution_Type IN ('journal', 'conference', 'publication', 'project')
  `;

  const params: (string | number)[] = [];
  if (departmentId && departmentId !== "all") {
    researchQuery += " AND f.F_dept = ?";
    params.push(departmentId);
  }

  researchQuery += " ORDER BY fc.Year DESC, f.F_dept, f.F_name";

  const researchData = (await query(researchQuery, params)) as ResearchItem[];

  if (
    !researchData ||
    !Array.isArray(researchData) ||
    researchData.length === 0
  ) {
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text("No research data found", 14, 50);
    return [doc, filename];
  }

  // Prepare data for table
  const tableData = researchData.map((item) => [
    item.F_name,
    item.F_dept,
    item.Title || "N/A",
    item.Type || "N/A",
    item.Year?.toString() || "N/A",
    item.Journal_Conference || "N/A",
  ]) as RowInput[];

  // Add table
  autoTable(doc, {
    head: [
      [
        "Faculty Name",
        "Department",
        "Title",
        "Type",
        "Year",
        "Journal/Conference",
      ],
    ],
    body: tableData,
    startY: 45,
    theme: "grid",
    headStyles: { fillColor: [75, 70, 229], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 255] },
    margin: { top: 45 },
    columnStyles: {
      2: { cellWidth: 60 }, // Title column wider
      5: { cellWidth: 40 }, // Journal column wider
    },
  });

  // Add department-wise research statistics
  doc.addPage();
  doc.setFontSize(16);
  doc.text("Research Statistics by Department", 14, 22);

  // Fetch department-wise statistics
  const statsQuery = `
    SELECT 
      f.F_dept AS Department,
      COUNT(DISTINCT fc.Contribution_ID) AS TotalContributions,
      SUM(CASE WHEN fc.Contribution_Type = 'journal' THEN 1 ELSE 0 END) AS JournalPublications,
      SUM(CASE WHEN fc.Contribution_Type = 'conference' THEN 1 ELSE 0 END) AS ConferencePublications,
      SUM(CASE WHEN fc.Contribution_Type = 'project' THEN 1 ELSE 0 END) AS ResearchProjects
    FROM faculty f
    LEFT JOIN faculty_contributions fc ON f.F_id = fc.F_ID
    ${departmentId && departmentId !== "all" ? "WHERE f.F_dept = ?" : ""}
    GROUP BY f.F_dept
    ORDER BY f.F_dept
  `;

  const statsParams =
    departmentId && departmentId !== "all" ? [departmentId] : [];
  const statsData = (await query(statsQuery, statsParams)) as ResearchStats[];

  if (statsData && Array.isArray(statsData) && statsData.length > 0) {
    const statsTableData = statsData.map((stat) => [
      stat.Department || "N/A",
      stat.TotalContributions?.toString() || "0",
      stat.JournalPublications?.toString() || "0",
      stat.ConferencePublications?.toString() || "0",
      stat.ResearchProjects?.toString() || "0",
    ]) as RowInput[];

    autoTable(doc, {
      head: [
        [
          "Department",
          "Total Contributions",
          "Journal Publications",
          "Conference Papers",
          "Research Projects",
        ],
      ],
      body: statsTableData,
      startY: 30,
      theme: "grid",
      headStyles: { fillColor: [75, 70, 229], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 255] },
    });
  }

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      "Institute Management System - NAAC/NBA Reports",
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  return [doc, filename];
}

// Helper function to generate full report
async function generateFullReport(
  departmentId?: string
): Promise<[jsPDF, string]> {
  const doc = new jsPDF();
  const filename = `full_report_${departmentId || "all"}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  // Cover page
  doc.setFontSize(24);
  doc.text(
    "Institute Management System",
    doc.internal.pageSize.getWidth() / 2,
    40,
    { align: "center" }
  );
  doc.setFontSize(18);
  doc.text("Comprehensive Report", doc.internal.pageSize.getWidth() / 2, 55, {
    align: "center",
  });

  doc.setFontSize(14);
  doc.text(
    `Department: ${departmentId || "All Departments"}`,
    doc.internal.pageSize.getWidth() / 2,
    80,
    { align: "center" }
  );
  doc.text(
    `Generated on: ${new Date().toLocaleString()}`,
    doc.internal.pageSize.getWidth() / 2,
    90,
    { align: "center" }
  );

  doc.setFontSize(12);
  doc.text(
    "This report contains comprehensive statistics about faculty, students,",
    doc.internal.pageSize.getWidth() / 2,
    120,
    { align: "center" }
  );
  doc.text(
    "and research activities for NAAC and NBA accreditation.",
    doc.internal.pageSize.getWidth() / 2,
    130,
    { align: "center" }
  );

  // Add faculty statistics section
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Faculty Statistics", 14, 20);

  // Generate and include faculty statistics directly in this doc
  await generateFacultyReport(departmentId);

  // Add research statistics section
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Research Output", 14, 20);

  // Generate and include research statistics directly in this doc
  await generateResearchReport(departmentId);

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      "Institute Management System - NAAC/NBA Reports",
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  return [doc, filename];
}

// Mock download endpoint
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reportId = searchParams.get("id");

  if (!reportId) {
    return NextResponse.json(
      { success: false, message: "Report ID is required" },
      { status: 400 }
    );
  }

  try {
    // In a real implementation, we would:
    // 1. Look up the report in a database or file storage
    // 2. Generate or retrieve the actual PDF file
    // 3. Return it with appropriate headers

    // For this example, generate a simple PDF on-the-fly
    const [doc, filename] = await generateFacultyReport();
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
