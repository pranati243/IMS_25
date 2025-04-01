// import {
//   AcademicCapIcon,
//   BuildingLibraryIcon,
//   UserGroupIcon,
//   BookOpenIcon,
// } from "@heroicons/react/24/outline";
// import { formatNumber } from "@/app/lib/utils";
// import MainLayout from "@/app/components/layout/MainLayout";
// import StatsCard from "@/app/components/ui/StatsCard";
// import ChartCard from "@/app/components/ui/ChartCard";
// import DepartmentDistributionChart from "@/app/components/dashboard/DepartmentDistributionChart";
// import DepartmentBarChart from "@/app/components/dashboard/DepartmentBarChart";
// import AnnouncementCard from "@/app/components/dashboard/AnnouncementCard";
// import EventsCard from "@/app/components/dashboard/EventsCard";
// import { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Dashboard - IMS Portal",
//   description: "Overview of institute information and statistics",
// };

// export default async function DashboardPage() {
//   // Fetch all dashboard data from API
//   const dashboardData = await fetchDashboardData();

//   // Extract the needed data
//   const {
//     totalFaculty,
//     totalStudents,
//     totalDepartments,
//     totalCourses,
//     studentsByDepartment,
//   } = dashboardData;

//   return (
//     <MainLayout>
//       <div className="space-y-6">
//         {/* Page title */}
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
//           <p className="mt-1 text-sm text-gray-500">
//             Welcome to the IMS Portal Dashboard. Here&apos;s an overview of the
//             institute&apos;s information.
//           </p>
//         </div>

//         {/* Stats cards */}
//         <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
//           <StatsCard
//             title="Total Faculty"
//             value={formatNumber(totalFaculty)}
//             icon={<UserGroupIcon className="h-6 w-6 text-indigo-600" />}
//             trend="up"
//             change={5}
//             changeText="from last semester"
//           />
//           <StatsCard
//             title="Total Students"
//             value={formatNumber(totalStudents)}
//             icon={<AcademicCapIcon className="h-6 w-6 text-purple-600" />}
//             trend="up"
//             change={8}
//             changeText="from last semester"
//           />
//           <StatsCard
//             title="Departments"
//             value={formatNumber(totalDepartments)}
//             icon={<BuildingLibraryIcon className="h-6 w-6 text-blue-600" />}
//           />
//           <StatsCard
//             title="Courses"
//             value={formatNumber(totalCourses)}
//             icon={<BookOpenIcon className="h-6 w-6 text-pink-600" />}
//             trend="up"
//             change={3}
//             changeText="new courses added"
//           />
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
//           <ChartCard
//             title="Faculty Distribution"
//             subtitle="Department-wise faculty count"
//           >
//             <DepartmentDistributionChart dataKey="faculty" />
//           </ChartCard>

//           <ChartCard
//             title="Student Distribution"
//             subtitle="Department-wise student enrollment"
//           >
//             <DepartmentBarChart
//               data={studentsByDepartment}
//               dataKey="students"
//               barColor="#7c3aed"
//             />
//           </ChartCard>
//         </div>

//         {/* Announcements and Events */}
//         {/* <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
//           <AnnouncementCard />
//           <EventsCard />
//         </div> */}
//       </div>
//     </MainLayout>
//   );
// }

// async function fetchDashboardData() {
//   try {
//     // Fetch department statistics
//     const deptStatsResponse = await fetch(
//       `${process.env.NEXT_PUBLIC_SITE_URL}/api/departments/stats`
//     );

//     if (!deptStatsResponse.ok) {
//       throw new Error("Failed to fetch department stats");
//     }

//     const deptStatsData = await deptStatsResponse.json();

//     // Process department stats to get faculty and student distribution
//     const { departmentStats } = deptStatsData.data;

//     const facultyByDepartment = departmentStats.map((dept: any) => ({
//       department: dept.Department_Name,
//       count: dept.current_faculty_count,
//     }));

//     const studentsByDepartment = departmentStats.map((dept: any) => ({
//       department: dept.Department_Name,
//       count: dept.Total_Students,
//     }));

//     // Calculate totals
//     const totalFaculty = facultyByDepartment.reduce(
//       (sum: number, dept: any) => sum + dept.count,
//       0
//     );
//     const totalStudents = studentsByDepartment.reduce(
//       (sum: number, dept: any) => sum + dept.count,
//       0
//     );
//     const totalDepartments = departmentStats.length;

//     // Get courses count from API or use departments count * average courses per department as estimation
//     const totalCourses = totalDepartments * 30; // Estimate 30 courses per department

//     return {
//       totalFaculty,
//       totalStudents,
//       totalDepartments,
//       totalCourses,
//       facultyByDepartment,
//       studentsByDepartment,
//     };
//   } catch (error) {
//     console.error("Error fetching dashboard data:", error);
//     // Return minimal empty data structure as fallback
//     return {
//       totalFaculty: 0,
//       totalStudents: 0,
//       totalDepartments: 0,
//       totalCourses: 0,
//       facultyByDepartment: [],
//       studentsByDepartment: [],
//       recentAnnouncements: [],
//       upcomingEvents: [],
//     };
//   }
// }

// app/dashboard/page.tsx
import { Suspense } from "react";
import {
  AcademicCapIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { formatNumber } from "@/app/lib/utils";
import MainLayout from "@/app/components/layout/MainLayout";
import StatsCard from "@/app/components/ui/StatsCard";
import ChartCard from "@/app/components/ui/ChartCard";
import DepartmentDistributionChart from "@/app/components/dashboard/DepartmentDistributionChart";
import DepartmentBarChart from "@/app/components/dashboard/DepartmentBarChart";
import AnnouncementCard from "@/app/components/dashboard/AnnouncementCard";
import EventsCard from "@/app/components/dashboard/EventsCard";
import { Metadata } from "next";
import { RoleGuard } from "@/app/components/auth/RoleGuard";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { query } from "@/app/lib/db";

export const metadata: Metadata = {
  title: "Dashboard - IMS Portal",
  description: "Overview of institute information and statistics",
};

export default async function DashboardPage() {
  // Get the current user's role from the session
  const sessionToken = cookies().get("session_token")?.value;
  let userRole = "guest";
  let department = null;

  if (sessionToken) {
    try {
      const decoded = verify(
        sessionToken,
        process.env.JWT_SECRET || "your-secret-key"
      ) as { userId: number; role: string };

      userRole = decoded.role;

      // If HOD or faculty, get their department
      if (userRole === "hod" || userRole === "faculty") {
        const userData = await query(
          `
          SELECT d.Department_Name
          FROM users u
          JOIN faculty f ON u.email = f.Email
          JOIN departments d ON f.F_dept = d.Department_Code
          WHERE u.id = ?
          `,
          [decoded.userId]
        );

        if (userData && userData.length > 0) {
          department = userData[0].Department_Name;
        }
      }
    } catch (error) {
      console.error("Token verification failed:", error);
    }
  }

  // Fetch dashboard data based on role
  const dashboardData = await fetchDashboardData(userRole, department);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to the IMS Portal Dashboard. Here&apos;s an overview of the
            institute&apos;s information.
          </p>
        </div>

        {/* Stats cards - different stats for different roles */}
        <Suspense fallback={<div>Loading stats...</div>}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Faculty stats - visible to all except students */}
            <RoleGuard
              roles={["admin", "hod", "faculty", "staff"]}
              fallback={null}
            >
              <StatsCard
                title="Total Faculty"
                value={formatNumber(dashboardData.totalFaculty)}
                icon={<UserGroupIcon className="h-6 w-6 text-indigo-600" />}
                trend="up"
                change={5}
                changeText="from last semester"
              />
            </RoleGuard>

            {/* Student stats - visible to all */}
            <StatsCard
              title="Total Students"
              value={formatNumber(dashboardData.totalStudents)}
              icon={<AcademicCapIcon className="h-6 w-6 text-purple-600" />}
              trend="up"
              change={8}
              changeText="from last semester"
            />

            {/* Department stats - visible to admin and HODs */}
            <RoleGuard roles={["admin", "hod"]} fallback={null}>
              <StatsCard
                title="Departments"
                value={formatNumber(dashboardData.totalDepartments)}
                icon={<BuildingLibraryIcon className="h-6 w-6 text-blue-600" />}
              />
            </RoleGuard>

            {/* Course stats - visible to all */}
            <StatsCard
              title="Courses"
              value={formatNumber(dashboardData.totalCourses)}
              icon={<BookOpenIcon className="h-6 w-6 text-pink-600" />}
              trend="up"
              change={3}
              changeText="new courses added"
            />
          </div>
        </Suspense>

        {/* Charts - different charts for different roles */}
        <Suspense fallback={<div>Loading charts...</div>}>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Faculty Distribution - visible to admin and HODs */}
            <RoleGuard
              roles={["admin", "hod", "faculty", "staff"]}
              fallback={null}
            >
              <ChartCard
                title="Faculty Distribution"
                subtitle={
                  userRole === "hod"
                    ? `Faculty in ${department}`
                    : "Department-wise faculty count"
                }
              >
                <DepartmentDistributionChart
                  dataKey="faculty"
                  department={userRole === "hod" ? department : undefined}
                />
              </ChartCard>
            </RoleGuard>

            {/* Student Distribution - visible to all */}
            <ChartCard
              title="Student Distribution"
              subtitle={
                userRole === "hod"
                  ? `Students in ${department}`
                  : "Department-wise student enrollment"
              }
            >
              <DepartmentBarChart
                dataKey="students"
                barColor="#7c3aed"
                department={userRole === "hod" ? department : undefined}
              />
            </ChartCard>
          </div>
        </Suspense>

        {/* Announcements and Events - visible to all */}
        <Suspense fallback={<div>Loading updates...</div>}>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <AnnouncementCard />
            <EventsCard />
          </div>
        </Suspense>
      </div>
    </MainLayout>
  );
}

async function fetchDashboardData(role = "guest", department = null) {
  try {
    // Create absolute URL for API requests
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_SITE_URL);

    // Fetch department statistics
    let url = `${baseUrl}/api/departments/stats`;

    // If department head, add department filter
    if (role === "hod" && department) {
      url += `?department=${encodeURIComponent(department)}`;
    }

    const deptStatsResponse = await fetch(url, {
      cache: "no-store", // Ensure fresh data
    });

    if (!deptStatsResponse.ok) {
      throw new Error("Failed to fetch department stats");
    }

    const deptStatsData = await deptStatsResponse.json();

    // Process department stats to get faculty and student distribution
    const { departmentStats } = deptStatsData.data;

    const facultyByDepartment = departmentStats.map((dept: any) => ({
      department: dept.Department_Name,
      count: dept.current_faculty_count,
    }));

    const studentsByDepartment = departmentStats.map((dept: any) => ({
      department: dept.Department_Name,
      count: dept.Total_Students,
    }));

    // Calculate totals
    const totalFaculty = facultyByDepartment.reduce(
      (sum: number, dept: any) => sum + dept.count,
      0
    );

    const totalStudents = studentsByDepartment.reduce(
      (sum: number, dept: any) => sum + dept.count,
      0
    );

    const totalDepartments = departmentStats.length;

    // Get courses count - for HODs, show only their department's courses
    let totalCourses = 0;

    if (role === "hod" && department) {
      // Get department-specific course count
      const coursesResponse = await fetch(
        `${baseUrl}/api/courses/count?department=${encodeURIComponent(
          department
        )}`,
        { cache: "no-store" }
      );

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        totalCourses = coursesData.data.count;
      } else {
        // Fallback estimate for department (10 courses per department)
        totalCourses = 10;
      }
    } else {
      // For admins and others, show all courses
      // Estimate 30 courses per department as before
      totalCourses = totalDepartments * 30;
    }

    // For students, limit access to sensitive information
    if (role === "student") {
      // Students shouldn't see total faculty or detailed department breakdowns
      return {
        totalFaculty: 0, // Will be hidden in UI
        totalStudents: totalStudents,
        totalDepartments: totalDepartments,
        totalCourses: totalCourses,
        facultyByDepartment: [], // Will be hidden in UI
        studentsByDepartment: studentsByDepartment,
      };
    }

    return {
      totalFaculty,
      totalStudents,
      totalDepartments,
      totalCourses,
      facultyByDepartment,
      studentsByDepartment,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Return minimal empty data structure as fallback
    return {
      totalFaculty: 0,
      totalStudents: 0,
      totalDepartments: 0,
      totalCourses: 0,
      facultyByDepartment: [],
      studentsByDepartment: [],
    };
  }
}

// // app/dashboard/page.tsx
// import { checkAuth } from "@/app/lib/auth/server";
// import MainLayout from "@/app/components/layout/MainLayout";
// import StatsCard from "@/app/components/ui/StatsCard";
// import ChartCard from "@/app/components/ui/ChartCard";
// import DepartmentDistributionChart from "@/app/components/dashboard/DepartmentDistributionChart";
// import DepartmentBarChart from "@/app/components/dashboard/DepartmentBarChart";
// import PermissionGate from "@/app/components/auth/PermissionGate";

// export default async function DashboardPage() {
//   // Check if user is authenticated
//   const session = await checkAuth({ required: true });
//   const userRole = session?.user?.role;

//   return (
//     <MainLayout>
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
//           <p className="mt-1 text-sm text-gray-500">
//             Welcome to the IMS Portal Dashboard. Here&apos;s an overview of the
//             institute&apos;s information.
//           </p>
//         </div>

//         {/* Stats Cards - Different roles see different stats */}
//         <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
//           {/* Faculty stats - visible to all */}
//           <StatsCard
//             title="Total Faculty"
//             value="120"
//             icon={<UserGroupIcon className="h-6 w-6 text-indigo-600" />}
//           />

//           {/* Student stats - not visible to students */}
//           <PermissionGate resource="student" action="read">
//             <StatsCard
//               title="Total Students"
//               value="1,250"
//               icon={<AcademicCapIcon className="h-6 w-6 text-purple-600" />}
//             />
//           </PermissionGate>

//           {/* Department stats - visible to all */}
//           <StatsCard
//             title="Departments"
//             value="8"
//             icon={<BuildingLibraryIcon className="h-6 w-6 text-blue-600" />}
//           />

//           {/* Course stats - visible to all */}
//           <StatsCard
//             title="Courses"
//             value="45"
//             icon={<BookOpenIcon className="h-6 w-6 text-pink-600" />}
//           />
//         </div>

//         {/* Charts - Different charts for different roles */}
//         <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
//           {/* Faculty chart - visible to department heads and admins */}
//           <PermissionGate resource="faculty" action="read">
//             <ChartCard
//               title="Faculty Distribution"
//               subtitle="Department-wise faculty count"
//             >
//               <DepartmentDistributionChart dataKey="faculty" />
//             </ChartCard>
//           </PermissionGate>

//           {/* Student chart - not visible to students */}
//           <PermissionGate resource="student" action="read">
//             <ChartCard
//               title="Student Distribution"
//               subtitle="Department-wise student enrollment"
//             >
//               <DepartmentBarChart dataKey="students" barColor="#7c3aed" />
//             </ChartCard>
//           </PermissionGate>
//         </div>

//         {/* Department-specific content for department heads */}
//         {userRole === "department_head" && (
//           <div>
//             <ChartCard
//               title={`${session.user.departmentName} Department Overview`}
//               subtitle="Performance metrics and KPIs"
//             >
//               {/* Department-specific content here */}
//             </ChartCard>
//           </div>
//         )}
//       </div>
//     </MainLayout>
//   );
// }
