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
import { RowDataPacket } from "mysql2";

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
        case "student":
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
            student: studentData,
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
      case "student":
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
  // We'll determine HOD status by comparing with department.HOD_ID
  isHOD?: boolean; // Calculated field, not from database
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
  let facultyQuery = `SELECT 
    f.F_id,
    f.F_name,
    f.F_dept,
    fd.Email,
    fd.Current_Designation,
    fd.Highest_Degree,
    fd.Experience,
    fd.Date_of_Joining,
    (f.F_id = (
      SELECT dd.HOD_ID 
      FROM department d 
      LEFT JOIN department_details dd ON d.Department_ID = dd.Department_ID 
      WHERE d.Department_Name = f.F_dept
    )) AS isHOD
  FROM faculty f
  LEFT JOIN faculty_details fd ON f.F_id = fd.F_ID`;

  const params: (string | number)[] = [];
  if (departmentId && departmentId !== "all") {
    facultyQuery += " WHERE f.F_dept = ?";
    params.push(departmentId);
  }

  // Add ORDER BY clause with hierarchical sorting
  // First priority - HOD status (using departments.HOD_ID), then designation, then date of joining
  facultyQuery += ` ORDER BY 
    CASE 
      WHEN f.F_id = (
        SELECT dd.HOD_ID 
        FROM department d 
        LEFT JOIN department_details dd ON d.Department_ID = dd.Department_ID 
        WHERE d.Department_Name = f.F_dept
      ) THEN 0
      ELSE 1
    END,
    CASE 
      WHEN fd.Current_Designation = 'Professor' THEN 1
      WHEN fd.Current_Designation = 'Associate Professor' THEN 2
      WHEN fd.Current_Designation = 'Assistant Professor' THEN 3
      ELSE 4
    END,
    fd.Date_of_Joining`;

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
    (faculty.isHOD ? "HoD - " : "") + (faculty.Current_Designation || "N/A"),
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
      "Information Management System - NAAC/NBA Reports",
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  return [doc, filename];
}

// Helper function to generate student report
async function generateStudentsReport(
  departmentId?: string
): Promise<[jsPDF, string]> {
  const doc = new jsPDF();
  const filename = `student_report_${departmentId || "all"}_${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  // Add title
  doc.setFontSize(18);
  doc.text("Student Report", 14, 22);

  // Add report metadata
  doc.setFontSize(11);
  doc.text(`Department: ${departmentId || "All Departments"}`, 14, 30);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

  try {
    // Fetch student data from the database based on the actual structure
    let studentsQuery = `
      SELECT 
        s.id,
        s.username as name,
        s.email,
        s.branch,
        s.division
      FROM 
        student s
      ORDER BY 
        s.branch, s.division, s.username
    `;
    
    const params: (string | number)[] = [];
    // If departmentId is needed, we need to join with a department table or filter by branch
    if (departmentId && departmentId !== "all") {
      // Since there's no direct department_id in the student table structure provided,
      // we'll map the branch to department if needed
      studentsQuery = `
        SELECT 
          s.id,
          s.username as name,
          s.email,
          s.branch,
          s.division
        FROM 
          student s
        WHERE 
          s.branch = (
            SELECT Department_Name 
            FROM department 
            WHERE Department_ID = ?
          )
        ORDER BY 
          s.division, s.username
      `;
      params.push(parseInt(departmentId, 10));
    }
    
    const studentsData = (await query(studentsQuery, params)) as RowDataPacket[];
    
    if (!studentsData || !Array.isArray(studentsData) || studentsData.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0);
      doc.text("No student data found", 14, 50);
    } else {
      // Prepare data for main table
      const tableData = studentsData.map((student) => [
        student.id?.toString() || "N/A",
        student.name || "N/A",
        student.email || "N/A",
        student.branch || "N/A",
        student.division || "N/A"
      ]) as RowInput[];
      
      // Add student listing table
      autoTable(doc, {
        head: [
          ["ID", "Username", "Email", "Branch", "Division"],
        ],
        body: tableData,
        startY: 45,
        theme: "grid",
        headStyles: { fillColor: [75, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 255] },
        margin: { top: 45 },
        columnStyles: {
          0: { cellWidth: 15 }, // ID
          1: { cellWidth: 40 }, // Username
          2: { cellWidth: 50 }, // Email
          3: { cellWidth: 40 }, // Branch
          4: { cellWidth: 25 }, // Division
        },
      });
      
      // Add a new page for statistics if there are many students
      if (studentsData.length > 20) {
        doc.addPage();
      } else {
        // Add some space after the table
        const finalY = (doc as any).lastAutoTable.finalY || 200;
        doc.text("", 14, finalY + 20);
      }
      
      doc.setFontSize(14);
      doc.text("Student Statistics by Branch", 14, (doc as any).lastAutoTable.finalY + 20);
      
      // Get branch-wise student statistics
      const branchStatsQuery = `
        SELECT 
          branch,
          COUNT(id) as total_students
        FROM 
          student
        GROUP BY 
          branch
        ORDER BY 
          branch
      `;
      
      const branchStatsData = (await query(branchStatsQuery, [])) as RowDataPacket[];
      
      if (branchStatsData && Array.isArray(branchStatsData) && branchStatsData.length > 0) {
        // Branch distribution
        const statsTableData = branchStatsData.map((stat) => [
          stat.branch || "N/A",
          stat.total_students?.toString() || "0"
        ]) as RowInput[];
        
        autoTable(doc, {
          head: [
            ["Branch", "Total Students"],
          ],
          body: statsTableData,
          startY: (doc as any).lastAutoTable.finalY + 30,
          theme: "grid",
          headStyles: { fillColor: [75, 70, 229], textColor: 255 },
          alternateRowStyles: { fillColor: [240, 240, 255] },
        });
      }
      
      // Division-wise distribution
      doc.setFontSize(14);
      doc.text("Student Statistics by Division", 14, (doc as any).lastAutoTable.finalY + 20);
      
      const divisionStatsQuery = `
        SELECT 
          division,
          COUNT(id) as count
        FROM 
          student
        GROUP BY 
          division
        ORDER BY 
          division
      `;
      
      const divisionStatsData = (await query(divisionStatsQuery, [])) as RowDataPacket[];
      
      if (divisionStatsData && Array.isArray(divisionStatsData) && divisionStatsData.length > 0) {
        const divisionTableData = divisionStatsData.map((stat) => [
          stat.division || "N/A",
          stat.count?.toString() || "0",
        ]) as RowInput[];
        
        autoTable(doc, {
          head: [
            ["Division", "Number of Students"],
          ],
          body: divisionTableData,
          startY: (doc as any).lastAutoTable.finalY + 30,
          theme: "grid",
          headStyles: { fillColor: [75, 70, 229], textColor: 255 },
          alternateRowStyles: { fillColor: [240, 240, 255] },
        });
      }
    }
  } catch (error) {
    console.error("Error generating student report:", error);
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text("Error: Could not fetch student data", 14, 50);
    doc.text(error instanceof Error ? error.message : "Unknown error", 14, 60);
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
      "Information Management System - NAAC/NBA Reports",
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

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

  try {
    // Fetch research data from research_project_consultancies table
    let researchQuery = `
      SELECT 
        r.id,
        r.Academic_year,
        r.Type_Research_Project_Consultancy as Type,
        r.Branch,
        r.Name_Of_Project_Endownment as Title,
        r.Name_Of_Principal_Investigator_CoInvestigator as Investigators,
        r.Department_Of_Principal_Investigator as Department,
        r.Year_Of_Award,
        r.Amount_Sanctioned,
        r.Duration_Of_The_Project as Duration,
        r.Name_Of_The_Funding_Agency as Funding_Agency,
        r.Type_Govt_NonGovt
      FROM 
        research_project_consultancies r
    `;
    
    const params: (string | number)[] = [];
    if (departmentId && departmentId !== "all") {
      researchQuery += " WHERE r.Branch = (SELECT Department_Name FROM department WHERE Department_ID = ?)";
      params.push(parseInt(departmentId, 10));
    }

    researchQuery += " ORDER BY r.Academic_year DESC, r.Branch, r.Name_Of_Project_Endownment";

    const researchData = (await query(researchQuery, params)) as RowDataPacket[];

    if (!researchData || !Array.isArray(researchData) || researchData.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(255, 0, 0);
      doc.text("No research data found", 14, 50);
      return [doc, filename];
    }

    // Prepare data for table
    const tableData = researchData.map((item) => [
      item.Title || "N/A",
      item.Investigators || "N/A",
      item.Department || "N/A",
      item.Type || "N/A",
      item.Year_Of_Award || "N/A",
      item.Funding_Agency || "N/A",
      item.Amount_Sanctioned || "N/A",
    ]) as RowInput[];

    // Add table
    autoTable(doc, {
      head: [
        [
          "Project Title",
          "Investigators",
          "Department",
          "Type",
          "Year",
          "Funding Agency",
          "Amount"
        ],
      ],
      body: tableData,
      startY: 45,
      theme: "grid",
      headStyles: { fillColor: [75, 70, 229], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 255] },
      margin: { top: 45 },
      styles: { overflow: "linebreak", cellWidth: "auto" },
      columnStyles: {
        0: { cellWidth: 50 }, // Title column wider
        1: { cellWidth: 40 }, // Investigators column
        5: { cellWidth: 40 }, // Funding agency
      },
    });

    // Add department-wise research statistics
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Research Statistics by Department", 14, 20);

    // Fetch department-wise statistics
    const statsQuery = `
      SELECT 
        Branch AS Department,
        COUNT(*) AS TotalProjects,
        SUM(CASE WHEN Type_Research_Project_Consultancy = 'Research Project' THEN 1 ELSE 0 END) AS ResearchProjects,
        SUM(CASE WHEN Type_Research_Project_Consultancy = 'Consultancy' THEN 1 ELSE 0 END) AS Consultancies,
        SUM(CASE WHEN Type_Govt_NonGovt = 'Govt' THEN 1 ELSE 0 END) AS GovernmentFunded,
        SUM(CASE WHEN Type_Govt_NonGovt = 'NonGovt' THEN 1 ELSE 0 END) AS NonGovernmentFunded
      FROM 
        research_project_consultancies
      ${departmentId && departmentId !== "all" ? "WHERE Branch = (SELECT Department_Name FROM department WHERE Department_ID = ?)" : ""}
      GROUP BY 
        Branch
      ORDER BY 
        Branch
    `;

    const statsParams = departmentId && departmentId !== "all" ? [parseInt(departmentId, 10)] : [];
    const statsData = (await query(statsQuery, statsParams)) as RowDataPacket[];

    if (statsData && Array.isArray(statsData) && statsData.length > 0) {
      const statsTableData = statsData.map((stat) => [
        stat.Department || "N/A",
        stat.TotalProjects?.toString() || "0",
        stat.ResearchProjects?.toString() || "0",
        stat.Consultancies?.toString() || "0",
        stat.GovernmentFunded?.toString() || "0",
        stat.NonGovernmentFunded?.toString() || "0",
      ]) as RowInput[];

      autoTable(doc, {
        head: [
          [
            "Department",
            "Total Projects",
            "Research Projects",
            "Consultancies",
            "Govt Funded",
            "Non-Govt Funded",
          ],
        ],
        body: statsTableData,
        startY: 30,
        theme: "grid",
        headStyles: { fillColor: [75, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 255] },
      });
    }

    // Add funding agency distribution
    const fundingQuery = `
      SELECT 
        Name_Of_The_Funding_Agency as Agency,
        COUNT(*) as ProjectCount,
        SUM(CAST(REPLACE(REPLACE(Amount_Sanctioned, ',', ''), 'Rs. ', '') AS DECIMAL(15,2))) as TotalAmount
      FROM 
        research_project_consultancies
      ${departmentId && departmentId !== "all" ? "WHERE Branch = (SELECT Department_Name FROM department WHERE Department_ID = ?)" : ""}
      GROUP BY 
        Name_Of_The_Funding_Agency
      ORDER BY 
        ProjectCount DESC
      LIMIT 10
    `;

    const fundingParams = departmentId && departmentId !== "all" ? [parseInt(departmentId, 10)] : [];
    const fundingData = (await query(fundingQuery, fundingParams)) as RowDataPacket[];

    if (fundingData && Array.isArray(fundingData) && fundingData.length > 0) {
      doc.setFontSize(16);
      doc.text("Top Funding Agencies", 14, (doc as any).lastAutoTable.finalY + 20);

      const fundingTableData = fundingData.map((item) => [
        item.Agency || "N/A",
        item.ProjectCount?.toString() || "0",
        item.TotalAmount ? `Rs. ${item.TotalAmount.toLocaleString('en-IN')}` : "N/A",
      ]) as RowInput[];

      autoTable(doc, {
        head: [
          [
            "Funding Agency",
            "Project Count",
            "Total Amount Sanctioned",
          ],
        ],
        body: fundingTableData,
        startY: (doc as any).lastAutoTable.finalY + 30,
        theme: "grid",
        headStyles: { fillColor: [75, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 255] },
      });
    }
  } catch (error) {
    console.error("Error generating research report:", error);
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text("Error: Could not fetch research data", 14, 50);
    doc.text(error instanceof Error ? error.message : "Unknown error", 14, 60);
  }

  // Add footer with page numbers
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
      "Information Management System - NAAC/NBA Reports",
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
    "Information Management System",
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
    "This report contains comprehensive statistics about faculty, student,",
    doc.internal.pageSize.getWidth() / 2,
    120,
    { align: "center" }
  );
  doc.text(
    "research output, and academic performance metrics.",
    doc.internal.pageSize.getWidth() / 2,
    130,
    { align: "center" }
  );
  
  // Add NAAC and NBA section
  doc.addPage();
  
  // NAAC Statistics section
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("NAAC Statistics", 14, 20);
  
  // Fetch NAAC statistics
  try {
    const naacQuery = `
      SELECT 
        criteria,
        score,
        max_score,
        year
      FROM 
        naac_statistics
      ORDER BY 
        year DESC, criteria ASC
    `;
    
    const naacData = (await query(naacQuery, [])) as RowDataPacket[];
    
    if (naacData && Array.isArray(naacData) && naacData.length > 0) {
      const naacTableData = naacData.map(item => [
        item.criteria || "N/A",
        item.score?.toString() || "0",
        item.max_score?.toString() || "0",
        ((item.score / item.max_score) * 100).toFixed(2) + "%",
        item.year || "N/A"
      ]) as RowInput[];
      
      autoTable(doc, {
        head: [["Criteria", "Score", "Max Score", "Percentage", "Year"]],
        body: naacTableData,
        startY: 30,
        theme: "grid",
        headStyles: { fillColor: [75, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 255] },
      });
    } else {
      doc.setFontSize(12);
      doc.text("No NAAC statistics data available", 14, 40);
    }
  } catch (error) {
    console.error("Error fetching NAAC data:", error);
    doc.setFontSize(12);
    doc.text("Error fetching NAAC statistics", 14, 40);
  }
  
  // NBA Statistics section
  doc.addPage();
  doc.setFontSize(18);
  doc.text("NBA Statistics", 14, 20);
  
  // Fetch NBA statistics
  try {
    const nbaQuery = `
      SELECT 
        program,
        status,
        validity,
        year
      FROM 
        nba_statistics
      ORDER BY 
        year DESC, program ASC
    `;
    
    const nbaData = (await query(nbaQuery, [])) as RowDataPacket[];
    
    if (nbaData && Array.isArray(nbaData) && nbaData.length > 0) {
      const nbaTableData = nbaData.map(item => [
        item.program || "N/A",
        item.status || "N/A",
        item.validity || "N/A",
        item.year || "N/A"
      ]) as RowInput[];
      
      autoTable(doc, {
        head: [["Program", "Status", "Validity", "Year"]],
        body: nbaTableData,
        startY: 30,
        theme: "grid",
        headStyles: { fillColor: [75, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 255] },
      });
    } else {
      doc.setFontSize(12);
      doc.text("No NBA statistics data available", 14, 40);
      
      // If no data in table, provide sample/default data for demonstration
      const sampleNbaData = [
        ["Computer Science Engineering", "Accredited", "2023-2026", "2023"],
        ["Electronics Engineering", "Accredited", "2022-2025", "2022"],
        ["Mechanical Engineering", "Provisional", "2023-2024", "2023"],
        ["Civil Engineering", "Applied", "Pending", "2023"]
      ];
      
      autoTable(doc, {
        head: [["Program", "Status", "Validity", "Year"]],
        body: sampleNbaData,
        startY: 50,
        theme: "grid",
        headStyles: { fillColor: [75, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 255] },
      });
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("* Sample data shown for demonstration purposes", 14, (doc as any).lastAutoTable.finalY + 10);
    }
  } catch (error) {
    console.error("Error fetching NBA data:", error);
    doc.setFontSize(12);
    doc.text("Error fetching NBA statistics", 14, 40);
  }
  
  // Faculty statistics page
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Faculty Statistics", 14, 20);
  
  try {
    // Faculty designation distribution
    const facultyQuery = `
      SELECT 
        Current_Designation,
        COUNT(*) as count
      FROM 
        faculty_details
      GROUP BY 
        Current_Designation
      ORDER BY 
        count DESC
    `;
    
    const facultyData = (await query(facultyQuery, [])) as RowDataPacket[];
    
    if (facultyData && Array.isArray(facultyData) && facultyData.length > 0) {
      const facultyTableData = facultyData.map(item => [
        item.Current_Designation || "Not Specified",
        item.count?.toString() || "0"
      ]) as RowInput[];
      
      autoTable(doc, {
        head: [["Designation", "Count"]],
        body: facultyTableData,
        startY: 30,
        theme: "grid",
        headStyles: { fillColor: [75, 70, 229], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 255] },
      });
    }
  } catch (error) {
    console.error("Error fetching faculty data:", error);
  }
  
  // Generate Faculty Report
  const [facultyReportDoc, _] = await generateFacultyReport(departmentId);
  const facultyReportPageCount = facultyReportDoc.getNumberOfPages();
  
  for (let i = 1; i <= facultyReportPageCount; i++) {
    // Copy pages from faculty report
    doc.addPage();
    doc.setPage(doc.getNumberOfPages());
    
    // Since we can't directly copy pages between jsPDF instances,
    // we'll add a reference to the faculty report
    if (i === 1) {
      doc.setFontSize(18);
      doc.text("Faculty Details", 14, 20);
      doc.setFontSize(12);
      doc.text("Please see the Faculty Report section for complete details.", 14, 30);
    }
  }
  
  // Generate student Report
  const [studentsReportDoc, __] = await generateStudentsReport(departmentId);
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Student Enrollment Statistics", 14, 20);
  doc.setFontSize(12);
  doc.text("Please see the student Report section for complete details.", 14, 30);
  
  // Generate Research Report
  const [researchReportDoc, ___] = await generateResearchReport(departmentId);
  doc.addPage();
  doc.setFontSize(18);
  doc.text("Research Output", 14, 20);
  doc.setFontSize(12);
  doc.text("Please see the Research Report section for complete details.", 14, 30);

  // Add footer with page numbers
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
      "Information Management System - NAAC/NBA Reports",
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
