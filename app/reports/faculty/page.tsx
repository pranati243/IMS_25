"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/auth-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Loader2,
  Download,
  Printer,
  SortAsc,
  SortDesc,
  Filter,
  AlertCircle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EnhancedReportPreview } from "@/app/components/ui/enhanced-report-preview";

interface FacultyData {
  id: string;
  name: string;
  department: string;
  designation: string;
  highestDegree: string;
  experience: number;
  dateOfJoining: string;
}

export default function FacultyReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const departmentId = searchParams?.get("departmentId");

  const [isLoading, setIsLoading] = useState(true);
  const [facultyData, setFacultyData] = useState<FacultyData[]>([]);
  const [filteredData, setFilteredData] = useState<FacultyData[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FacultyData | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    department: string | null;
    designation: string | null;
    highestDegree: string | null;
  }>({
    department: null,
    designation: null,
    highestDegree: null,
  });
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [reportData, setReportData] = useState<{
    pdfBase64: string;
    filename: string;
    tableData?: any[];
    columns?: string[];
  }>({
    pdfBase64: "",
    filename: "",
  });
  const authErrorRef = useRef(false);

  // Get current user's signature
  const [facultySignature, setFacultySignature] = useState<string>("");

  // Filter options
  const [departments, setDepartments] = useState<string[]>([]);
  const [designations, setDesignations] = useState<string[]>([]);
  const [degrees, setDegrees] = useState<string[]>([]);

  // Fetch HOD name when user is available
  useEffect(() => {
    if (user?.username) {
      fetchHODName();
    }
  }, [user]);

  // Fetch faculty signature when user is available
  useEffect(() => {
    const fetchFacultySignature = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/faculty/signature");
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.signatureUrl) {
            setFacultySignature(result.signatureUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching signature:", error);
      }
    };

    fetchFacultySignature();
  }, [user]);
  // Check authentication status
  useEffect(() => {
    if (!authLoading && !user) {
      if (!authErrorRef.current) {
        // Set the flag to prevent multiple redirects
        authErrorRef.current = true;

        // Redirect to login if not authenticated
        const returnUrl = `/reports/faculty${
          departmentId ? `?departmentId=${departmentId}` : ""
        }`;
        console.log(
          `User not authenticated. Redirecting to login with returnUrl: ${returnUrl}`
        );

        router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      }
    } else if (user) {
      // Reset the flag if the user is logged in
      authErrorRef.current = false;
    }
  }, [user, authLoading, router, departmentId]);
  useEffect(() => {
    // Only fetch data if we have a user and authentication is complete
    if (authLoading || !user) return;

    const fetchFacultyData = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Add a timeout to detect slow requests
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Request timed out after 20 seconds"));
          }, 20000);
        });

        // Create the actual fetch request
        const fetchPromise = fetch("/api/reports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reportType: "faculty",
            departmentId: departmentId || "all",
            format: "json",
          }),
          credentials: "include", // Include credentials for auth cookies
        });

        // Use Promise.race to handle timeouts
        const response = (await Promise.race([
          fetchPromise,
          timeoutPromise,
        ])) as Response;

        if (response.status === 401) {
          setError("Unauthorized access. Please log in again.");

          if (!authErrorRef.current) {
            authErrorRef.current = true;
            const returnUrl = `/reports/faculty${
              departmentId ? `?departmentId=${departmentId}` : ""
            }`;
            router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
          }
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Failed to fetch faculty data: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data.success && data.data && data.data.tableData) {
          const transformedData = data.data.tableData.map((faculty: any) => ({
            id: faculty.id || faculty.F_id,
            name: faculty.name || faculty.F_name,
            department: faculty.department || faculty.F_dept,
            designation:
              faculty.designation || faculty.Current_Designation || "",
            highestDegree:
              faculty.highestDegree || faculty.Highest_Degree || "",
            experience: faculty.experience || faculty.Experience || 0,
            dateOfJoining:
              faculty.dateOfJoining || faculty.Date_of_Joining || "",
          }));

          setFacultyData(transformedData);
          setFilteredData(transformedData); // Extract unique values for filters
          setDepartments([
            ...new Set(transformedData.map((f: FacultyData) => f.department)),
          ] as string[]);
          setDesignations([
            ...new Set(
              transformedData
                .map((f: FacultyData) => f.designation)
                .filter(Boolean)
            ),
          ] as string[]);
          setDegrees([
            ...new Set(
              transformedData
                .map((f: FacultyData) => f.highestDegree)
                .filter(Boolean)
            ),
          ] as string[]);
        } else {
          setError("No data found or invalid response format");
        }
      } catch (error) {
        console.error("Error fetching faculty data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load faculty data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFacultyData();
  }, [departmentId, user, authLoading, router]);

  // Apply sorting
  const requestSort = (key: keyof FacultyData) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...facultyData];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (faculty) =>
          faculty.name.toLowerCase().includes(term) ||
          faculty.department.toLowerCase().includes(term) ||
          (faculty.designation &&
            faculty.designation.toLowerCase().includes(term)) ||
          (faculty.highestDegree &&
            faculty.highestDegree.toLowerCase().includes(term))
      );
    }

    // Apply filters
    if (filters.department) {
      result = result.filter(
        (faculty) => faculty.department === filters.department
      );
    }

    if (filters.designation) {
      result = result.filter(
        (faculty) => faculty.designation === filters.designation
      );
    }

    if (filters.highestDegree) {
      result = result.filter(
        (faculty) => faculty.highestDegree === filters.highestDegree
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof FacultyData];
        const bValue = b[sortConfig.key as keyof FacultyData];

        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredData(result);
  }, [facultyData, searchTerm, filters, sortConfig]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      department: null,
      designation: null,
      highestDegree: null,
    });
    setSortConfig({ key: null, direction: "asc" });
  };

  // State to store HOD name
  const [hodName, setHodName] = useState<string>("Prof. YYY ZZZ");

  // Fetch HOD name using the consolidated reports API
  const fetchHODName = async () => {
    if (!user?.username) return;

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestType: "hod-lookup",
          facultyId: user.username,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.hodName) {
          setHodName(data.hodName);
        }
      }
    } catch (error) {
      console.error("Error fetching HOD name:", error);
    }
  }; // Handle PDF generation and download with institutional letterhead
  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 14;

      // Add letterhead logo - wait for it to load
      try {
        // Create a promise to wait for logo to load
        const logoPromise = new Promise<void>((resolve, reject) => {
          const logoImg = new Image();
          logoImg.onload = () => {
            try {
              doc.addImage(logoImg, "JPEG", 15, 15, 25, 25);
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          logoImg.onerror = () => reject(new Error("Logo failed to load"));
          logoImg.src = "/report-logo.jpg";

          // Set timeout to prevent hanging
          setTimeout(() => reject(new Error("Logo loading timeout")), 5000);
        });

        // Try to load logo, fallback to placeholder if it fails
        try {
          await logoPromise;
        } catch (logoError) {
          console.warn("Logo loading failed:", logoError);
          // Fallback: Logo placeholder box
          doc.rect(15, 15, 25, 25);
          doc.setFontSize(8);
          doc.text("LOGO", 22, 30);
        }
      } catch (logoError) {
        // Fallback: Logo placeholder box
        doc.rect(15, 15, 25, 25);
        doc.setFontSize(8);
        doc.text("LOGO", 22, 30);
      }

      // College header
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Agnel Charities", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(16);
      doc.text(
        "Fr. C. Rodrigues Institute of Technology, Vashi",
        pageWidth / 2,
        28,
        { align: "center" }
      );

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "(An Autonomous Institute & Permanently Affiliated to University of Mumbai)",
        pageWidth / 2,
        35,
        { align: "center" }
      );

      // Report title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Faculty Details and Activities Report", pageWidth / 2, 50, {
        align: "center",
      });

      // Add date and filters info
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      let yPos = 65;
      doc.text(
        `Generated on: ${new Date().toLocaleDateString("en-IN")}`,
        margin,
        yPos
      );

      if (filters.department) {
        yPos += 7;
        doc.text(`Department: ${filters.department}`, margin, yPos);
      }

      if (filters.designation || filters.highestDegree) {
        yPos += 7;
        let filterText = "Filters: ";
        if (filters.designation)
          filterText += `Designation: ${filters.designation}; `;
        if (filters.highestDegree)
          filterText += `Highest Degree: ${filters.highestDegree}; `;
        doc.text(filterText, margin, yPos);
      }

      // Create enhanced table data with activities format
      const tableData = filteredData.map((faculty, index) => [
        (index + 1).toString(), // Sr. No
        faculty.name,
        faculty.designation || "",
        faculty.department,
        faculty.dateOfJoining
          ? new Date(faculty.dateOfJoining).toLocaleDateString("en-IN")
          : "",
        faculty.highestDegree || "",
        faculty.experience?.toString() + " years" || "",
      ]);

      // Add main data table
      autoTable(doc, {
        head: [
          [
            "Sr. No",
            "Faculty Name",
            "Designation",
            "Department",
            "Date of Joining",
            "Qualification",
            "Experience",
          ],
        ],
        body: tableData,
        startY: yPos + 15,
        theme: "grid",
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: 0,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          halign: "center",
        },
        styles: {
          overflow: "linebreak",
          cellWidth: "auto",
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 15 }, // Sr. No
          1: { cellWidth: 40 }, // Name
          2: { cellWidth: 30 }, // Designation
          3: { cellWidth: 30 }, // Department
          4: { cellWidth: 25 }, // Date
          5: { cellWidth: 25 }, // Qualification
          6: { cellWidth: 20 }, // Experience
        },
      });

      // Get final Y position after table
      const finalY = (doc as any).lastAutoTable.finalY || yPos + 100;

      // Add signature section
      const signatureY = Math.max(
        finalY + 30,
        doc.internal.pageSize.height - 80
      );

      // Faculty signature (left side)
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Faculty Signature:", margin, signatureY);

      // Add faculty signature image if available
      if (facultySignature) {
        try {
          // Convert signature URL to base64 and add to PDF
          const fullSignatureUrl = facultySignature.startsWith("http")
            ? facultySignature
            : `${window.location.origin}${facultySignature}`;
          doc.addImage(fullSignatureUrl, "PNG", margin, signatureY + 5, 40, 15);
        } catch (sigError) {
          console.warn("Could not add signature image:", sigError);
          doc.line(margin, signatureY + 15, margin + 60, signatureY + 15); // Fallback signature line
        }
      } else {
        doc.line(margin, signatureY + 15, margin + 60, signatureY + 15); // Signature line
      }

      // Get faculty name (assuming current user is generating the report)
      const facultyName = user?.name || "Prof. XXXX XXXX";
      doc.text(facultyName, margin, signatureY + 25);
      doc.text("Faculty", margin, signatureY + 32);

      // HOD signature (right side)
      const hodX = pageWidth - margin - 60;
      doc.text("HOD Signature:", hodX, signatureY);
      doc.line(hodX, signatureY + 15, hodX + 60, signatureY + 15); // Signature line (HOD signature will be blank as requested)

      // Use HOD name from state (fetched from database via API)
      doc.text(hodName, hodX, signatureY + 25);
      doc.text("Head of Department", hodX, signatureY + 32);

      // Add footer with page numbers
      const pageCount = doc.internal.pages.length;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Save PDF with proper filename
      const department =
        filters.department ||
        (filteredData.length > 0 ? filteredData[0].department : "Unknown");
      const departmentCode = department
        .replace(/[^A-Za-z]/g, "")
        .substring(0, 4)
        .toUpperCase();
      const dateStr = new Date().toISOString().split("T")[0];
      doc.save(`Faculty_Activities_Report_${departmentCode}_${dateStr}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloading(false);
    }
  };

  // Handle printing with institutional letterhead
  const handlePrint = async () => {
    try {
      setPrinting(true);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 14;

      // Add letterhead logo - wait for it to load
      try {
        // Create a promise to wait for logo to load
        const logoPromise = new Promise<void>((resolve, reject) => {
          const logoImg = new Image();
          logoImg.onload = () => {
            try {
              doc.addImage(logoImg, "JPEG", 15, 15, 25, 25);
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          logoImg.onerror = () => reject(new Error("Logo failed to load"));
          logoImg.src = "/report-logo.jpg";

          // Set timeout to prevent hanging
          setTimeout(() => reject(new Error("Logo loading timeout")), 5000);
        });

        // Try to load logo, fallback to placeholder if it fails
        try {
          await logoPromise;
        } catch (logoError) {
          console.warn("Logo loading failed:", logoError);
          // Fallback: Logo placeholder box
          doc.rect(15, 15, 25, 25);
          doc.setFontSize(8);
          doc.text("LOGO", 22, 30);
        }
      } catch (logoError) {
        // Fallback: Logo placeholder box
        doc.rect(15, 15, 25, 25);
        doc.setFontSize(8);
        doc.text("LOGO", 22, 30);
      }

      // College header
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Agnel Charities", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(16);
      doc.text(
        "Fr. C. Rodrigues Institute of Technology, Vashi",
        pageWidth / 2,
        28,
        { align: "center" }
      );

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "(An Autonomous Institute & Permanently Affiliated to University of Mumbai)",
        pageWidth / 2,
        35,
        { align: "center" }
      );

      // Report title
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Faculty Details and Activities Report", pageWidth / 2, 50, {
        align: "center",
      });

      // Add date and filters info
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      let yPos = 65;
      doc.text(
        `Generated on: ${new Date().toLocaleDateString("en-IN")}`,
        margin,
        yPos
      );

      if (filters.department) {
        yPos += 7;
        doc.text(`Department: ${filters.department}`, margin, yPos);
      }

      if (filters.designation || filters.highestDegree) {
        yPos += 7;
        let filterText = "Filters: ";
        if (filters.designation)
          filterText += `Designation: ${filters.designation}; `;
        if (filters.highestDegree)
          filterText += `Highest Degree: ${filters.highestDegree}; `;
        doc.text(filterText, margin, yPos);
      }

      // Create enhanced table data with activities format
      const tableData = filteredData.map((faculty, index) => [
        (index + 1).toString(), // Sr. No
        faculty.name,
        faculty.designation || "",
        faculty.department,
        faculty.dateOfJoining
          ? new Date(faculty.dateOfJoining).toLocaleDateString("en-IN")
          : "",
        faculty.highestDegree || "",
        faculty.experience?.toString() + " years" || "",
      ]);

      // Add main data table
      autoTable(doc, {
        head: [
          [
            "Sr. No",
            "Faculty Name",
            "Designation",
            "Department",
            "Date of Joining",
            "Qualification",
            "Experience",
          ],
        ],
        body: tableData,
        startY: yPos + 15,
        theme: "grid",
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: 0,
          fontStyle: "bold",
          halign: "center",
        },
        bodyStyles: {
          halign: "center",
        },
        styles: {
          overflow: "linebreak",
          cellWidth: "auto",
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 15 }, // Sr. No
          1: { cellWidth: 40 }, // Name
          2: { cellWidth: 30 }, // Designation
          3: { cellWidth: 30 }, // Department
          4: { cellWidth: 25 }, // Date
          5: { cellWidth: 25 }, // Qualification
          6: { cellWidth: 20 }, // Experience
        },
      });

      // Get final Y position after table
      const finalY = (doc as any).lastAutoTable.finalY || yPos + 100;

      // Add signature section
      const signatureY = Math.max(
        finalY + 30,
        doc.internal.pageSize.height - 80
      );

      // Faculty signature (left side)
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Faculty Signature:", margin, signatureY);

      // Add faculty signature image if available
      if (facultySignature) {
        try {
          // Convert signature URL to base64 and add to PDF
          const fullSignatureUrl = facultySignature.startsWith("http")
            ? facultySignature
            : `${window.location.origin}${facultySignature}`;
          doc.addImage(fullSignatureUrl, "PNG", margin, signatureY + 5, 40, 15);
        } catch (sigError) {
          console.warn("Could not add signature image:", sigError);
          doc.line(margin, signatureY + 15, margin + 60, signatureY + 15); // Fallback signature line
        }
      } else {
        doc.line(margin, signatureY + 15, margin + 60, signatureY + 15); // Signature line
      }

      // Get faculty name (assuming current user is generating the report)
      const facultyName = user?.name || "Prof. XXXX XXXX";
      doc.text(facultyName, margin, signatureY + 25);
      doc.text("Faculty", margin, signatureY + 32);

      // HOD signature (right side)
      const hodX = pageWidth - margin - 60;
      doc.text("HOD Signature:", hodX, signatureY);
      doc.line(hodX, signatureY + 15, hodX + 60, signatureY + 15); // Signature line (HOD signature will be blank as requested)

      // Use HOD name from state (fetched from database via API)
      const department =
        filters.department ||
        (filteredData.length > 0 ? filteredData[0].department : "");
      doc.text(hodName, hodX, signatureY + 25);
      doc.text("Head of Department", hodX, signatureY + 32);

      // Add footer with page numbers
      const pageCount = doc.internal.pages.length;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Open and print
      const pdfDataUri = doc.output("dataurlstring");
      const printWindow = window.open(pdfDataUri);

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          setPrinting(false);
        };
      } else {
        setPrinting(false);
      }
    } catch (error) {
      console.error("Error printing PDF:", error);
      setPrinting(false);
    }
  };

  // Sorting indicator component
  const SortIndicator = ({ column }: { column: keyof FacultyData }) => {
    if (sortConfig.key !== column) {
      return null;
    }
    return sortConfig.direction === "asc" ? (
      <SortAsc className="h-4 w-4 inline-block ml-1" />
    ) : (
      <SortDesc className="h-4 w-4 inline-block ml-1" />
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Faculty Report</h1>

        <div className="space-x-4 flex">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            Clear Filters
          </Button>

          <Button
            onClick={handlePrint}
            disabled={printing || isLoading || filteredData.length === 0}
            className="flex items-center gap-2"
          >
            {printing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            Print
          </Button>

          <Button
            onClick={handleDownloadPDF}
            disabled={downloading || isLoading || filteredData.length === 0}
            className="flex items-center gap-2"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        {/* Filters */}
        <div className="p-4 border-b flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <Input
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Select
              value={filters.department || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  department: value === "all" ? null : value,
                })
              }
            >
              {" "}
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={filters.designation || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  designation: value === "all" ? null : value,
                })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Designation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Designations</SelectItem>
                {designations.map((designation) => (
                  <SelectItem key={designation} value={designation}>
                    {designation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            {" "}
            <Select
              value={filters.highestDegree || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  highestDegree: value === "all" ? null : value,
                })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Highest Degree" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Degrees</SelectItem>
                {degrees.map((degree) => (
                  <SelectItem key={degree} value={degree}>
                    {degree}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>{" "}
        {/* Table */}
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading faculty data...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              No faculty records found with the current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort("name")}
                  >
                    Name <SortIndicator column="name" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort("designation")}
                  >
                    Designation <SortIndicator column="designation" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort("dateOfJoining")}
                  >
                    Date of Joining <SortIndicator column="dateOfJoining" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort("department")}
                  >
                    Department <SortIndicator column="department" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort("highestDegree")}
                  >
                    Highest Degree <SortIndicator column="highestDegree" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort("experience")}
                  >
                    Experience (Years) <SortIndicator column="experience" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((faculty) => (
                  <TableRow key={faculty.id}>
                    <TableCell className="font-medium">
                      {faculty.name}
                    </TableCell>
                    <TableCell>{faculty.designation}</TableCell>
                    <TableCell>
                      {faculty.dateOfJoining
                        ? new Date(faculty.dateOfJoining).toLocaleDateString(
                            "en-IN"
                          )
                        : ""}
                    </TableCell>
                    <TableCell>{faculty.department}</TableCell>
                    <TableCell>{faculty.highestDegree}</TableCell>
                    <TableCell>{faculty.experience}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="text-center text-gray-500 text-sm">
        <p>
          Showing {filteredData.length} of {facultyData.length} faculty members
        </p>
      </div>
    </div>
  );
}
