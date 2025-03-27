// User Roles
export type UserRole = "admin" | "faculty" | "hod" | "student";

// User
export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Faculty
export type Faculty = {
  id: number;
  userId: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  employeeId: string;
  qualifications: string[];
  joiningDate: Date;
  contact: string;
  expertise: string[];
  isHOD: boolean;
  profileImage?: string;
  publications?: number;
  projects?: number;
  achievements?: string[];
};

// Department
export type Department = {
  id: number;
  name: string;
  code: string;
  hodId?: number;
  facultyCount: number;
  studentCount: number;
  establishedYear: number;
  courses: string[];
  description?: string;
};

// Student
export type Student = {
  id: number;
  userId: number;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  batch: string;
  semester: number;
  cgpa?: number;
  attendance?: number;
  contact: string;
  guardianContact: string;
  profileImage?: string;
};

// Course
export type Course = {
  id: number;
  code: string;
  name: string;
  department: string;
  semester: number;
  credits: number;
  facultyId?: number;
  description?: string;
};

// Dashboard Stats
export type DashboardStats = {
  totalFaculty: number;
  totalStudents: number;
  totalDepartments: number;
  totalCourses: number;
  facultyByDepartment: {
    department: string;
    count: number;
  }[];
  studentsByDepartment: {
    department: string;
    count: number;
  }[];
  recentAnnouncements: {
    id: number;
    title: string;
    content: string;
    date: Date;
    author: string;
  }[];
  upcomingEvents: {
    id: number;
    title: string;
    date: Date;
    location: string;
  }[];
};
