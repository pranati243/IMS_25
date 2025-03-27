import { DashboardStats, Department, Faculty, Student } from "./types";

// Mock Departments
export const departments: Department[] = [
  {
    id: 1,
    name: "Computer Science & Engineering",
    code: "CSE",
    hodId: 1,
    facultyCount: 24,
    studentCount: 480,
    establishedYear: 1990,
    courses: ["B.Tech", "M.Tech", "Ph.D"],
    description:
      "The Department of Computer Science & Engineering offers undergraduate and postgraduate programs that prepare students for successful careers in computing and related fields.",
  },
  {
    id: 2,
    name: "Electronics & Communication Engineering",
    code: "ECE",
    hodId: 5,
    facultyCount: 18,
    studentCount: 360,
    establishedYear: 1992,
    courses: ["B.Tech", "M.Tech", "Ph.D"],
    description:
      "The Department of Electronics & Communication Engineering focuses on the study of electronic devices, circuits, and communication systems.",
  },
  {
    id: 3,
    name: "Mechanical Engineering",
    code: "ME",
    hodId: 9,
    facultyCount: 16,
    studentCount: 320,
    establishedYear: 1985,
    courses: ["B.Tech", "M.Tech", "Ph.D"],
    description:
      "The Department of Mechanical Engineering offers comprehensive education in design, manufacturing, and thermal sciences.",
  },
  {
    id: 4,
    name: "Electrical Engineering",
    code: "EE",
    hodId: 13,
    facultyCount: 15,
    studentCount: 300,
    establishedYear: 1988,
    courses: ["B.Tech", "M.Tech"],
    description:
      "The Department of Electrical Engineering focuses on power systems, control systems, and electrical machines.",
  },
  {
    id: 5,
    name: "Civil Engineering",
    code: "CE",
    hodId: 17,
    facultyCount: 14,
    studentCount: 280,
    establishedYear: 1980,
    courses: ["B.Tech", "M.Tech"],
    description:
      "The Department of Civil Engineering prepares students for careers in structural engineering, transportation, and environmental engineering.",
  },
];

// Mock Faculty
export const faculty: Faculty[] = [
  {
    id: 1,
    userId: 101,
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@ims.edu",
    department: "CSE",
    designation: "Professor & HOD",
    employeeId: "EMP001",
    qualifications: ["Ph.D. Computer Science", "M.Tech", "B.Tech"],
    joiningDate: new Date("2010-07-15"),
    contact: "9876543210",
    expertise: ["Machine Learning", "Data Science", "Computer Vision"],
    isHOD: true,
    publications: 45,
    projects: 8,
    achievements: ["Best Teacher Award 2022", "IEEE Senior Member"],
  },
  {
    id: 2,
    userId: 102,
    name: "Dr. Priya Sharma",
    email: "priya.sharma@ims.edu",
    department: "CSE",
    designation: "Associate Professor",
    employeeId: "EMP002",
    qualifications: ["Ph.D. Computer Science", "M.Tech", "B.Tech"],
    joiningDate: new Date("2012-08-20"),
    contact: "9876543211",
    expertise: ["Artificial Intelligence", "Deep Learning", "NLP"],
    isHOD: false,
    publications: 32,
    projects: 5,
    achievements: ["Research Excellence Award 2021"],
  },
  {
    id: 5,
    userId: 105,
    name: "Dr. Anand Verma",
    email: "anand.verma@ims.edu",
    department: "ECE",
    designation: "Professor & HOD",
    employeeId: "EMP005",
    qualifications: ["Ph.D. Electronics", "M.Tech", "B.Tech"],
    joiningDate: new Date("2008-06-10"),
    contact: "9876543215",
    expertise: ["VLSI Design", "Embedded Systems", "Signal Processing"],
    isHOD: true,
    publications: 38,
    projects: 7,
    achievements: ["Distinguished Faculty Award 2020"],
  },
];

// Mock Students (limited sample)
export const students: Student[] = [
  {
    id: 1,
    userId: 1001,
    name: "Amit Singh",
    email: "amit.singh@ims.edu",
    rollNumber: "CSE001",
    department: "CSE",
    batch: "2021-2025",
    semester: 5,
    cgpa: 9.2,
    attendance: 92,
    contact: "9876543001",
    guardianContact: "9876543002",
    profileImage: "/students/amit.jpg",
  },
  {
    id: 2,
    userId: 1002,
    name: "Sneha Patel",
    email: "sneha.patel@ims.edu",
    rollNumber: "CSE002",
    department: "CSE",
    batch: "2021-2025",
    semester: 5,
    cgpa: 8.9,
    attendance: 88,
    contact: "9876543003",
    guardianContact: "9876543004",
    profileImage: "/students/sneha.jpg",
  },
];

// Mock Dashboard Stats
export const dashboardStats: DashboardStats = {
  totalFaculty: 87,
  totalStudents: 1740,
  totalDepartments: 5,
  totalCourses: 152,
  facultyByDepartment: [
    { department: "CSE", count: 24 },
    { department: "ECE", count: 18 },
    { department: "ME", count: 16 },
    { department: "EE", count: 15 },
    { department: "CE", count: 14 },
  ],
  studentsByDepartment: [
    { department: "CSE", count: 480 },
    { department: "ECE", count: 360 },
    { department: "ME", count: 320 },
    { department: "EE", count: 300 },
    { department: "CE", count: 280 },
  ],
  recentAnnouncements: [
    {
      id: 1,
      title: "NBA Committee Visit",
      content:
        "The NBA Committee will be visiting our college on April 4th. All departments must prepare the necessary documentation and presentations.",
      date: new Date("2023-03-20"),
      author: "Principal",
    },
    {
      id: 2,
      title: "Faculty Development Program",
      content:
        'A week-long Faculty Development Program on "Modern Pedagogical Techniques" will be held from April 10-15, 2023.',
      date: new Date("2023-03-18"),
      author: "IQAC Coordinator",
    },
    {
      id: 3,
      title: "Research Grant Opportunity",
      content:
        "AICTE has announced new research grants for innovative projects. Last date to submit proposals is April 30, 2023.",
      date: new Date("2023-03-15"),
      author: "R&D Cell",
    },
  ],
  upcomingEvents: [
    {
      id: 1,
      title: "NBA Committee Visit",
      date: new Date("2023-04-04"),
      location: "College Campus",
    },
    {
      id: 2,
      title: "Technical Symposium",
      date: new Date("2023-04-15"),
      location: "Main Auditorium",
    },
    {
      id: 3,
      title: "Campus Recruitment Drive - TCS",
      date: new Date("2023-04-20"),
      location: "Placement Cell",
    },
  ],
};
