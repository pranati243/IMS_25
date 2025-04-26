"use client";

import { useEffect, useState } from "react";
import {
  UserGroupIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
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
import { DashboardStats } from "@/app/lib/types";

interface DepartmentStat {
  Department_ID: number;
  Department_Name: string;
  current_faculty_count: number;
  Total_Students: number;
}

interface DepartmentData {
  department: string;
  count: number;
}

// Mock data for announcements and events until we have API endpoints
const mockAnnouncements = [
  {
    id: 1,
    title: "Faculty Excellence Awards",
    content:
      "Nominations for the annual faculty excellence awards are now open.",
    date: new Date("2024-10-15"),
    author: "Academic Office",
  },
  {
    id: 2,
    title: "New Research Grants",
    content:
      "The institute has secured 5 new research grants worth Rs. 2.5 Crores.",
    date: new Date("2024-10-10"),
    author: "Research Cell",
  },
  {
    id: 3,
    title: "Student Exchange Program",
    content:
      "Applications for the international student exchange program are now being accepted.",
    date: new Date("2024-10-05"),
    author: "International Relations Office",
  },
];

const mockEvents = [
  {
    id: 1,
    title: "Annual Technical Symposium",
    date: new Date("2024-11-15"),
    location: "Main Auditorium",
  },
  {
    id: 2,
    title: "Industry Connect Workshop",
    date: new Date("2024-10-25"),
    location: "Seminar Hall",
  },
  {
    id: 3,
    title: "Research Methodology Seminar",
    date: new Date("2024-11-05"),
    location: "Conference Room",
  },
];

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    totalFaculty: 0,
    totalStudents: 0,
    totalDepartments: 0,
    totalCourses: 0,
    facultyByDepartment: [],
    studentsByDepartment: [],
    recentAnnouncements: [],
    upcomingEvents: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Extract the needed data
  const {
    totalFaculty,
    totalStudents,
    totalDepartments,
    totalCourses,
    facultyByDepartment,
    studentsByDepartment,
  } = dashboardData;

  // You can create a loading state if needed
  if (loading) {
    return (
      <MainLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/4 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg shadow"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-100 rounded-lg shadow"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

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

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Faculty"
            value={formatNumber(totalFaculty)}
            icon={<UserGroupIcon className="h-6 w-6 text-indigo-600" />}
            trend="up"
            change={5}
            changeText="from last semester"
          />
          <StatsCard
            title="Total Students"
            value={formatNumber(totalStudents)}
            icon={<AcademicCapIcon className="h-6 w-6 text-purple-600" />}
            trend="up"
            change={8}
            changeText="from last semester"
          />
          <StatsCard
            title="Departments"
            value={formatNumber(totalDepartments)}
            icon={<BuildingLibraryIcon className="h-6 w-6 text-blue-600" />}
          />
          <StatsCard
            title="Courses"
            value={formatNumber(totalCourses)}
            icon={<BookOpenIcon className="h-6 w-6 text-pink-600" />}
            trend="up"
            change={3}
            changeText="new courses added"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Faculty Distribution by Department">
            <DepartmentDistributionChart
              dataKey="faculty"
              data={facultyByDepartment}
            />
          </ChartCard>
          <ChartCard title="Students by Department">
            <DepartmentBarChart
              data={studentsByDepartment}
              barColor="#8b5cf6"
            />
          </ChartCard>
        </div>

        {/* Debug information */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Debug Data:</h3>
            <div className="text-xs">
              <p>
                Faculty by Department: {JSON.stringify(facultyByDepartment)}
              </p>
            </div>
          </div>
        )}

        {/* Announcements and Events */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnnouncementCard announcements={mockAnnouncements} />
          <EventsCard events={mockEvents} />
        </div>
      </div>
    </MainLayout>
  );
}

async function fetchDashboardData(): Promise<DashboardStats> {
  try {
    // Fetch department statistics
    const deptStatsResponse = await fetch(`/api/departments/stats`);

    if (!deptStatsResponse.ok) {
      throw new Error("Failed to fetch department stats");
    }

    const deptStatsData = await deptStatsResponse.json();

    // Process department stats to get faculty and student distribution
    const { departmentStats } = deptStatsData.data;

    const facultyByDepartment: DepartmentData[] = departmentStats.map(
      (dept: DepartmentStat) => ({
        department: dept.Department_Name,
        count: dept.current_faculty_count || 0,
      })
    );

    const studentsByDepartment: DepartmentData[] = departmentStats.map(
      (dept: DepartmentStat) => ({
        department: dept.Department_Name,
        count: dept.Total_Students || 0,
      })
    );

    // Calculate totals
    const totalFaculty = facultyByDepartment.reduce(
      (sum: number, dept: DepartmentData) => sum + dept.count,
      0
    );
    const totalStudents = studentsByDepartment.reduce(
      (sum: number, dept: DepartmentData) => sum + dept.count,
      0
    );
    const totalDepartments = departmentStats.length;

    // Get courses count from API or use departments count * average courses per department as estimation
    const totalCourses = totalDepartments * 6; // Estimate 6 courses per department

    return {
      totalFaculty,
      totalStudents,
      totalDepartments,
      totalCourses,
      facultyByDepartment,
      studentsByDepartment,
      recentAnnouncements: mockAnnouncements,
      upcomingEvents: mockEvents,
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
      recentAnnouncements: mockAnnouncements,
      upcomingEvents: mockEvents,
    };
  }
}
