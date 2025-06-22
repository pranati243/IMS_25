import { query } from "@/app/lib/db";

// Function to fetch faculty data in JSON format
export async function getFacultyReportData(
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
    const results = await query(sql, params) as any[];

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

// Function to fetch student data in JSON format
export async function getStudentsReportData(
  departmentId?: string
): Promise<[any[], string[]]> {
  try {
    // Using the student table structure provided in requirements
    let sql = `
      SELECT 
        s.id,
        s.username as name,
        s.branch as department,
        s.division,
        s.email
      FROM 
        student s
    `;

    // Add WHERE clause if departmentId is specified
    const params: any[] = [];
    if (departmentId && departmentId !== "all") {
      sql += " WHERE s.branch = ?";
      params.push(departmentId);
    }

    sql += " ORDER BY s.username";

    // Execute query - handle case where table might not exist
    let results: any[] = [];
    try {
      const queryResults = await query(sql, params);
      if (Array.isArray(queryResults)) {
        results = queryResults;
      }
    } catch (error) {
      console.error("Error fetching student data from student table:", error);
      
      // Fallback to alternative student table if exists
      try {
        const fallbackSql = `
          SELECT 
            s.id,
            s.name,
            s.department as branch,
            s.division,
            s.email
          FROM 
            student s
        `;
        
        const fallbackParams: any[] = [];
        if (departmentId && departmentId !== "all") {
          sql += " WHERE s.department = ?";
          fallbackParams.push(departmentId);
        }
        
        sql += " ORDER BY s.name";
        
        const fallbackResults = await query(fallbackSql, fallbackParams);
        if (Array.isArray(fallbackResults)) {
          results = fallbackResults;
        }
      } catch (fallbackError) {
        console.error("Error fetching from fallback student table:", fallbackError);
      }
    }

    // Columns for the table
    const columns = ["id", "name", "department", "division", "email"];

    return [results, columns];
  } catch (error) {
    console.error("Error fetching student data:", error);
    return [[], []];
  }
}

// Function to fetch research data in JSON format
export async function getResearchReportData(
  departmentId?: string
): Promise<[any[], string[]]> {
  try {
    // Combine data from multiple sources for a comprehensive research report
    let results: any[] = [];
    
    // 1. First, fetch research publications from faculty_contributions
    let contributionsSql = `
      SELECT 
        f.F_name as faculty_name,
        f.F_dept as department,
        fc.Description as title,
        fc.Contribution_Type as type,
        YEAR(fc.Contribution_Date) as year,
        fc.Recognized_By as venue,
        'contribution' as source
      FROM 
        faculty_contributions fc
      JOIN 
        faculty f ON fc.F_ID = f.F_id
      WHERE 
        (
          fc.Contribution_Type LIKE '%journal%' OR 
          fc.Contribution_Type LIKE '%conference%' OR 
          fc.Contribution_Type LIKE '%publication%' OR 
          fc.Contribution_Type LIKE '%research%' OR
          fc.Contribution_Type LIKE '%paper%'
        )
    `;

    // Add departmentId filter if specified
    const params1: any[] = [];
    if (departmentId && departmentId !== "all") {
      contributionsSql += " AND f.F_dept = ?";
      params1.push(departmentId);
    }

    contributionsSql += " ORDER BY fc.Contribution_Date DESC, f.F_name";

    // 2. Also fetch from paper_publication table if it exists
    let publicationsSql = `
      SELECT 
        f.F_name as faculty_name,
        f.F_dept as department,
        pp.title,
        'publication' as type,
        YEAR(pp.publication_date) as year,
        pp.journal_name as venue,
        'paper_publication' as source
      FROM 
        paper_publication pp
      JOIN 
        faculty f ON pp.id = f.F_id
    `;

    // Add departmentId filter if specified
    const params2: any[] = [];
    if (departmentId && departmentId !== "all") {
      publicationsSql += " WHERE f.F_dept = ?";
      params2.push(departmentId);
    }

    publicationsSql += " ORDER BY pp.publication_date DESC, f.F_name";

    // 3. Also fetch from research_project_consultancies table
    let projectsSql = `
      SELECT 
        Name_Of_Principal_Investigator_CoInvestigator as faculty_name,
        Department_Of_Principal_Investigator as department,
        Name_Of_Project_Endownment as title,
        'research project' as type,
        YEAR(Year_Of_Award) as year,
        Name_Of_The_Funding_Agency as venue,
        Amount_Sanctioned as funding_amount,
        'research_project' as source
      FROM 
        research_project_consultancies
    `;

    // Add departmentId filter if specified
    const params3: any[] = [];
    if (departmentId && departmentId !== "all") {
      projectsSql += " WHERE Department_Of_Principal_Investigator = ?";
      params3.push(departmentId);
    }

    projectsSql += " ORDER BY Year_Of_Award DESC, Name_Of_Principal_Investigator_CoInvestigator";

    // Execute all queries and combine results
    try {
      const contributionsResults = await query(contributionsSql, params1);
      if (Array.isArray(contributionsResults) && contributionsResults.length > 0) {
        results = [...results, ...contributionsResults];
      }
    } catch (error) {
      console.error("Error fetching research contributions:", error);
    }

    try {
      const publicationsResults = await query(publicationsSql, params2);
      if (Array.isArray(publicationsResults) && publicationsResults.length > 0) {
        results = [...results, ...publicationsResults];
      }
    } catch (error) {
      console.error("Error fetching paper publications:", error);
    }

    try {
      const projectsResults = await query(projectsSql, params3);
      if (Array.isArray(projectsResults) && projectsResults.length > 0) {
        results = [...results, ...projectsResults];
      }
    } catch (error) {
      console.error("Error fetching research projects:", error);
    }

    // Columns for the table
    const columns = [
      "faculty_name",
      "department",
      "title",
      "type",
      "year",
      "venue",
      "funding_amount",
      "source"
    ];

    return [results, columns];
  } catch (error) {
    console.error("Error fetching research data:", error);
    return [[], []];
  }
}
