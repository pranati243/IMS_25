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
import { dashboardStats } from "@/app/lib/mockData";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - IMS Portal",
  description: "Overview of institute information and statistics",
};

export default async function DashboardPage() {
  const {
    totalFaculty,
    totalStudents,
    totalDepartments,
    totalCourses,
    facultyByDepartment,
    studentsByDepartment,
    recentAnnouncements,
    upcomingEvents,
  } = dashboardStats;

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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ChartCard
            title="Faculty Distribution"
            subtitle="Department-wise faculty count"
          >
            <DepartmentDistributionChart
              data={facultyByDepartment}
              dataKey="faculty"
            />
          </ChartCard>

          <ChartCard
            title="Student Distribution"
            subtitle="Department-wise student enrollment"
          >
            <DepartmentBarChart
              data={studentsByDepartment}
              dataKey="Students"
              barColor="#7c3aed"
            />
          </ChartCard>
        </div>

        {/* Announcements and Events */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <AnnouncementCard announcements={recentAnnouncements} />
          <EventsCard events={upcomingEvents} />
        </div>
      </div>
    </MainLayout>
  );
}
