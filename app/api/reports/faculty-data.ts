// Add these functions to fetch faculty data in JSON format
async function getFacultyReportData(
  departmentId?: string
): Promise<[any[], string[]]> {
  try {
    // Base query to get faculty details
    let sql = `
      SELECT 
        f.F_id,
        f.F_name as name,
        f.F_dept as department,
        fd.Current_Designation as designation,
        fd.Highest_Degree as highestDegree,
        fd.Experience as experience,
        fd.Date_of_Joining as dateOfJoining
      FROM 
        faculty f
      LEFT JOIN 
        faculty_details fd ON f.F_id = fd.F_ID
    `;

    // Add WHERE clause if departmentId is specified
    const params: any[] = [];
    if (departmentId && departmentId !== "all") {
      sql += " WHERE f.F_dept = ?";
      params.push(departmentId);
    }

    sql += " ORDER BY f.F_name";

    // Execute query
    const results = await query(sql, params);

    // Columns for the table
    const columns = [
      "name",
      "designation",
      "dateOfJoining",
      "department",
      "highestDegree",
      "experience",
    ];

    return [results, columns];
  } catch (error) {
    console.error("Error fetching faculty data:", error);
    return [[], []];
  }
}

async function getStudentsReportData(
  departmentId?: string
): Promise<[any[], string[]]> {
  try {
    // This is a placeholder - modify according to your student data structure
    let sql = `
      SELECT 
        s.id,
        s.name,
        s.department,
        s.year,
        s.enrollment_number
      FROM 
        student s
    `;

    // Add WHERE clause if departmentId is specified
    const params: any[] = [];
    if (departmentId && departmentId !== "all") {
      sql += " WHERE s.department = ?";
      params.push(departmentId);
    }

    sql += " ORDER BY s.name";

    // Execute query - handle case where table might not exist
    let results;
    try {
      results = await query(sql, params);
    } catch (error) {
      console.error("Error fetching student data:", error);
      results = [];
    }

    // Columns for the table
    const columns = ["name", "department", "year", "enrollment_number"];

    return [results, columns];
  } catch (error) {
    console.error("Error fetching student data:", error);
    return [[], []];
  }
}

async function getResearchReportData(
  departmentId?: string
): Promise<[any[], string[]]> {
  try {
    // Fetch research publications from faculty_contributions
    let sql = `
      SELECT 
        f.F_name as faculty_name,
        f.F_dept as department,
        fc.Title as title,
        fc.Type as type,
        fc.Year as year,
        fc.Journal_Conference as venue
      FROM 
        faculty_contributions fc
      JOIN 
        faculty f ON fc.F_ID = f.F_id
      WHERE 
        fc.Type IN ('journal', 'conference', 'publication', 'book', 'book_chapter')
    `;

    // Add departmentId filter if specified
    const params: any[] = [];
    if (departmentId && departmentId !== "all") {
      sql += " AND f.F_dept = ?";
      params.push(departmentId);
    }

    sql += " ORDER BY fc.Year DESC, f.F_name";

    // Execute query
    let results;
    try {
      results = await query(sql, params);
    } catch (error) {
      console.error("Error fetching research data:", error);
      results = [];
    }

    // Columns for the table
    const columns = [
      "faculty_name",
      "department",
      "title",
      "type",
      "year",
      "venue",
    ];

    return [results, columns];
  } catch (error) {
    console.error("Error fetching research data:", error);
    return [[], []];
  }
}
