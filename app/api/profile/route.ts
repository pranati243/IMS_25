// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";

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

    const userId = authData.user.id;
    const userRole = authData.user.role;
    const username = authData.user.username;

    // Get base user data
    const userData = await query(
      `SELECT 
        id, username, email, role, name, department_id, 
        is_active, created_at, last_login
      FROM users 
      WHERE id = ?`,
      [userId]
    );

    if (!userData || !Array.isArray(userData) || userData.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const user = userData[0];

    // Get department name if user has a department
    let departmentName = null;
    if (user.department_id) {
      const departmentData = await query(
        `SELECT Department_Name FROM department WHERE Department_ID = ?`,
        [user.department_id]
      );

      if (
        departmentData &&
        Array.isArray(departmentData) &&
        departmentData.length > 0
      ) {
        departmentName = departmentData[0].Department_Name;
      }
    }

    // Initialize profile object with base user data
    const profile = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department_id,
      departmentName: departmentName,
      joinDate: user.created_at,
      lastLogin: user.last_login,
      profileImage: "",
    };

    // Get role-specific data
    if (userRole === "faculty" || userRole === "hod") {
      // Get faculty data
      const facultyData = await query(
        `SELECT 
          f.F_ID, f.Email, f.Phone_Number, f.Current_Designation, 
          f.Highest_Degree, f.Experience,
          COUNT(DISTINCT c.contribution_id) as total_contributions,
          COUNT(DISTINCT p.SrNo) as professional_memberships
        FROM 
          faculty_details f
        LEFT JOIN 
          faculty_contributions c ON f.F_ID = c.f_id
        LEFT JOIN 
          faculty_professional_body p ON f.F_ID = p.F_ID
        WHERE 
          f.F_ID = ?
        GROUP BY 
          f.F_ID, f.Email, f.Phone_Number, f.Current_Designation, 
          f.Highest_Degree, f.Experience`,
        [username]
      );

      if (facultyData && Array.isArray(facultyData) && facultyData.length > 0) {
        const faculty = facultyData[0];

        // Extend profile with faculty data
        profile.facultyId = faculty.F_ID;
        profile.designation = faculty.Current_Designation;
        profile.qualification = faculty.Highest_Degree;
        profile.experience = faculty.Experience;
        profile.phone = faculty.Phone_Number;
        profile.professionalMemberships = faculty.professional_memberships || 0;
        profile.totalContributions = faculty.total_contributions || 0;
      }

      // Get publications
      const publicationsData = await query(
        `SELECT 
          p.id, p.title_of_the_paper, p.name_of_the_conference as journal, p.Year_Of_Study, p.paper_link
        FROM 
          paper_publication p
        INNER JOIN 
          faculty f ON p.id = f.F_id
        WHERE 
          f.F_ID = ?
        ORDER BY 
          p.Year_Of_Study DESC`,
        [username]
      );

      if (publicationsData && Array.isArray(publicationsData)) {
        profile.publications = publicationsData;
      }

      // Get achievements
      const achievementsData = await query(
        `SELECT 
          c.Contribution_ID as id, 
          c.Contribution_Type as title, 
          c.Description as description, 
          c.Contribution_Date as date
        FROM 
          faculty_contributions c
        INNER JOIN 
          faculty f ON c.F_ID = f.F_id
        WHERE 
          f.F_id = ?
        ORDER BY 
          c.Contribution_Date DESC`,
        [username]
      );

      if (achievementsData && Array.isArray(achievementsData)) {
        profile.achievements = achievementsData;
      }

      // Initialize research projects count to 0 (table doesn't exist yet)
      profile.researchProjects = 0;

      /* Commenting out research_projects query since the table doesn't exist yet
      // Get research projects count
      const projectsData = await query(
        `SELECT 
          COUNT(*) as research_projects
        FROM 
          research_projects r
        INNER JOIN 
          faculty f ON r.faculty_id = f.F_id
        WHERE 
          f.Faculty_ID = ?`,
        [username]
      );

      if (
        projectsData &&
        Array.isArray(projectsData) &&
        projectsData.length > 0
      ) {
        profile.researchProjects = projectsData[0].research_projects || 0;
      }
      */
    } else if (userRole === "student") {
      // Get student data
      const studentData = await query(
        `SELECT 
          s.id, s.name, s.enrollment_no, s.department_id,
          s.semester, s.program
        FROM 
          students s
        INNER JOIN 
          users u ON s.enrollment_no = u.username
        WHERE 
          u.id = ?`,
        [userId]
      );

      if (studentData && Array.isArray(studentData) && studentData.length > 0) {
        const student = studentData[0];

        // Extend profile with student data
        profile.studentId = student.id;
        profile.enrollmentNo = student.enrollment_no;
        profile.semester = student.semester;
        profile.program = student.program;
      }
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch profile information" },
      { status: 500 }
    );
  }
}
