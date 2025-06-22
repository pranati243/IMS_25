// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

// Define interfaces for type safety
interface User extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  role: string;
  name: string;
  department_id: number | null;
  is_active: boolean;
  created_at: string;
  last_login: string;
}

interface Department extends RowDataPacket {
  Department_ID: number;
  Department_Name: string;
}

interface FacultyDetails extends RowDataPacket {
  F_ID: string;
  Email: string | null;
  Phone_Number: string | null;
  Current_Designation: string | null;
  Highest_Degree: string | null;
  Experience: number | null;
  total_contributions: number;
  professional_memberships: number;
  workshops_attended: number;
}

interface Publication extends RowDataPacket {
  id: number;
  title_of_the_paper: string;
  name_of_the_conference: string;
  Year_Of_Study: string;
  paper_link: string;
}

interface Achievement extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface Student extends RowDataPacket {
  id: number;
  name: string;
  department_id: number;
  semester: number;
  program: string;
}

interface ProfileData {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  department: number | null;
  departmentName: string | null;
  joinDate: string;
  lastLogin: string;
  profileImage: string;
  facultyId?: string;
  designation?: string | null;
  qualification?: string | null;
  experience?: number | null;
  phone?: string | null;
  professionalMemberships?: number;
  totalContributions?: number;
  publications?: Publication[];
  achievements?: Achievement[];
  researchProjects?: number;
  workshopsAttended?: number;
  studentId?: number;
  enrollmentNo?: string;
  semester?: number;
  program?: string;
}

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
    ) as User[];

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
      ) as Department[];

      if (
        departmentData &&
        Array.isArray(departmentData) &&
        departmentData.length > 0
      ) {
        departmentName = departmentData[0].Department_Name;
      }
    }

    // Initialize profile object with base user data
    const profile: ProfileData = {
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
      ) as FacultyDetails[];

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
      try {
        const publicationsData = await query(
          `SELECT 
            p.id, 
            p.title_of_the_paper, 
            p.name_of_the_conference as journal, 
            p.Year_Of_Study as year, 
            p.paper_link as url
          FROM 
            paper_publication p
          WHERE 
            p.id = ?
          ORDER BY 
            p.Year_Of_Study DESC`,
          [username]
        ) as Publication[];

        if (publicationsData && Array.isArray(publicationsData)) {
          profile.publications = publicationsData;
        }
      } catch (error) {
        console.error("Error fetching publications:", error);
        profile.publications = [];
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
        WHERE 
          c.F_ID = ?
        ORDER BY 
          c.Contribution_Date DESC`,
        [username]
      ) as Achievement[];

      if (achievementsData && Array.isArray(achievementsData)) {
        profile.achievements = achievementsData;
      }

      // Get research projects count
      try {
        const projectsData = await query(
          `SELECT 
            COUNT(*) as research_projects
          FROM 
            research_project_consultancies
          WHERE 
            user_id = ?`,
          [username]
        ) as RowDataPacket[];

        if (projectsData && Array.isArray(projectsData) && projectsData.length > 0) {
          profile.researchProjects = projectsData[0].research_projects || 0;
        } else {
          profile.researchProjects = 0;
        }
      } catch (error) {
        console.error("Error fetching research projects count:", error);
        profile.researchProjects = 0;
      }

      // Get workshops count
      try {
        const workshopsData = await query(
          `SELECT 
            COUNT(*) as workshops_attended
          FROM 
            faculty_workshops
          WHERE 
            faculty_id = ?`,
          [username]
        ) as RowDataPacket[];

        // Also check for workshop-like entries in contributions table
        const workshopContributionsData = await query(
          `SELECT 
            COUNT(*) as workshop_contributions
          FROM 
            faculty_contributions
          WHERE 
            F_ID = ? AND 
            (
              Contribution_Type LIKE '%workshop%' OR 
              Contribution_Type LIKE '%seminar%' OR 
              Contribution_Type LIKE '%conference%' OR
              Contribution_Type LIKE '%training%'
            )`,
          [username]
        ) as RowDataPacket[];

        const workshopsCount = 
          (workshopsData && Array.isArray(workshopsData) && workshopsData.length > 0 
            ? workshopsData[0].workshops_attended || 0 
            : 0) +
          (workshopContributionsData && Array.isArray(workshopContributionsData) && workshopContributionsData.length > 0
            ? workshopContributionsData[0].workshop_contributions || 0
            : 0);

        profile.workshopsAttended = workshopsCount;
      } catch (error) {
        console.error("Error fetching workshops count:", error);
        profile.workshopsAttended = 0;
      }

      // Get professional memberships count
      try {
        const membershipsData = await query(
          `SELECT 
            COUNT(*) as memberships
          FROM 
            faculty_memberships
          WHERE 
            faculty_id = ?`,
          [username]
        ) as RowDataPacket[];

        if (membershipsData && Array.isArray(membershipsData) && membershipsData.length > 0) {
          profile.professionalMemberships = membershipsData[0].memberships || 0;
        } else {
          profile.professionalMemberships = 0;
        }
      } catch (error) {
        console.error("Error fetching memberships count:", error);
        // Keep the current value or set to 0 if not already set
        profile.professionalMemberships = profile.professionalMemberships || 0;
      }
    } else if (userRole === "student") {
      // Get student data
      const studentData = await query(
        `SELECT 
          s.id, s.name, s.department_id,
          s.semester, s.program
        FROM 
          student s

        WHERE 
          u.id = ?`,
        [userId]
      ) as Student[];

      if (studentData && Array.isArray(studentData) && studentData.length > 0) {
        const student = studentData[0];

        // Extend profile with student data
        profile.studentId = student.id;
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
