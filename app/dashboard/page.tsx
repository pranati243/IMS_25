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
"use client";

import { useState } from "react";
import {
  UserGroupIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import MainLayout from "@/app/components/layout/MainLayout";
import StatsCard from "@/app/components/ui/StatsCard";
import ChartCard from "@/app/components/ui/ChartCard";
import DepartmentDistributionChart from "@/app/components/dashboard/DepartmentDistributionChart";
import DepartmentBarChart from "@/app/components/dashboard/DepartmentBarChart";
import AnnouncementCard from "@/app/components/dashboard/AnnouncementCard";
import EventsCard from "@/app/components/dashboard/EventsCard";
import PermissionGate from "@/app/components/auth/PermissionGate";

export default function DashboardPage() {
  // Since we're bypassing auth, set a mock user role for UI purposes
  const [userRole] = useState<string>("admin");

  // Mock session user data
  const mockSessionUser = {
    departmentName: "Computer Science",
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to the IMS Portal Dashboard. Here&apos;s an overview of the
            institute&apos;s information.
          </p>
        </div>

        {/* Stats Cards - Different roles see different stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Faculty stats - visible to all */}
          <StatsCard
            title="Total Faculty"
            value="120"
            icon={<UserGroupIcon className="h-6 w-6 text-indigo-600" />}
            trend="up"
            change={5}
            changeText="from last semester"
          />

          {/* Student stats - not visible to students */}
          <PermissionGate resource="student" action="read">
            <StatsCard
              title="Total Students"
              value="1,250"
              icon={<AcademicCapIcon className="h-6 w-6 text-purple-600" />}
              trend="up"
              change={8}
              changeText="from last semester"
            />
          </PermissionGate>

          {/* Department stats - visible to all */}
          <StatsCard
            title="Departments"
            value="8"
            icon={<BuildingLibraryIcon className="h-6 w-6 text-blue-600" />}
          />

          {/* Course stats - visible to all */}
          <StatsCard
            title="Courses"
            value="45"
            icon={<BookOpenIcon className="h-6 w-6 text-pink-600" />}
            trend="up"
            change={3}
            changeText="new courses added"
          />
        </div>

        {/* Charts - Different charts for different roles */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Faculty chart - visible to department heads and admins */}
          <PermissionGate resource="faculty" action="read">
            <ChartCard
              title="Faculty Distribution"
              subtitle="Department-wise faculty count"
            >
              <DepartmentDistributionChart dataKey="faculty" />
            </ChartCard>
          </PermissionGate>

          {/* Student chart - not visible to students */}
          <PermissionGate resource="student" action="read">
            <ChartCard
              title="Student Distribution"
              subtitle="Department-wise student enrollment"
            >
              <DepartmentBarChart dataKey="students" barColor="#7c3aed" />
            </ChartCard>
          </PermissionGate>
        </div>

        {/* Department-specific content for department heads */}
        {userRole === "hod" && (
          <div>
            <ChartCard
              title={`${mockSessionUser.departmentName} Department Overview`}
              subtitle="Performance metrics and KPIs"
            >
              {/* Department-specific content here */}
              <div className="h-64 flex items-center justify-center text-gray-500">
                Department-specific metrics and charts will appear here
              </div>
            </ChartCard>
          </div>
        )}

        {/* Announcements and Events */}
        {/* <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <AnnouncementCard />
          <EventsCard />
        </div> */}
      </div>
    </MainLayout>
  );
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
