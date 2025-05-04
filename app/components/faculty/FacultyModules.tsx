"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Award,
  FileText,
  Users,
  Briefcase,
  GraduationCap,
  ArrowRight,
  BookMarked,
  Globe,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDepartmentStyle } from "@/app/lib/theme";
import { Skeleton } from "@/components/ui/skeleton";

interface FacultyInfo {
  F_id: number;
  F_name: string;
  F_dept: string;
  Email: string;
  Current_Designation: string;
  total_contributions: number;
  professional_memberships: number;
  publications?: number;
  research_projects?: number;
  workshops_attended?: number;
  awards?: number;
}

interface FacultyModulesProps {
  facultyId?: number;
}

export default function FacultyModules({ facultyId }: FacultyModulesProps) {
  const [facultyInfo, setFacultyInfo] = useState<FacultyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacultyInfo = async () => {
      try {
        setLoading(true);

        // If facultyId is provided, fetch that specific faculty member's information
        // Otherwise fetch the current logged-in faculty member's information
        const endpoint = facultyId
          ? `/api/faculty/${facultyId}`
          : "/api/faculty/me";

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error("Failed to fetch faculty information");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to fetch faculty information"
          );
        }

        // Add some mock data for demonstration purposes
        const enrichedData = {
          ...data.data,
          publications: Math.floor(Math.random() * 20) + 5,
          research_projects: Math.floor(Math.random() * 8) + 2,
          workshops_attended: Math.floor(Math.random() * 15) + 10,
          awards: Math.floor(Math.random() * 5) + 1,
        };

        setFacultyInfo(enrichedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching faculty info:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyInfo();
  }, [facultyId]);

  if (loading) {
    return <FacultyModulesSkeleton />;
  }

  if (error || !facultyInfo) {
    return (
      <div className="bg-red-50 text-red-500 p-6 rounded-md">
        <p className="font-medium">Error loading faculty information</p>
        <p className="text-sm mt-1">
          {error || "Faculty information not available"}
        </p>
      </div>
    );
  }

  const departmentStyle = getDepartmentStyle(facultyInfo.F_dept);

  return (
    <div className="space-y-6">
      {/* Faculty info header */}
      <Card className="overflow-hidden">
        <div
          className="h-2"
          style={{ backgroundColor: departmentStyle.primary }}
        />
        <CardHeader>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold"
              style={{ backgroundColor: departmentStyle.primary }}
            >
              {facultyInfo.F_name.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-2xl">{facultyInfo.F_name}</CardTitle>
              <CardDescription>
                {facultyInfo.Current_Designation} | {facultyInfo.F_dept}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Welcome to your faculty dashboard. Here you can manage all your
            academic records including publications, research projects, and
            more.
          </p>
        </CardContent>
      </Card>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Publications Module */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <div
            className="h-1"
            style={{ backgroundColor: departmentStyle.primary }}
          />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Publications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{facultyInfo.publications}</p>
            <p className="text-sm text-gray-500 mt-1">
              Research papers and articles published
            </p>
          </CardContent>
          <CardFooter>
            <Link href={`/faculty/publications`} className="w-full">
              <Button
                variant="outline"
                className="w-full flex justify-between items-center"
              >
                Manage Publications
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Research Projects */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-1" style={{ backgroundColor: "#16a34a" }} />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Research Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {facultyInfo.research_projects}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Ongoing and completed research projects
            </p>
          </CardContent>
          <CardFooter>
            <Link href={`/faculty/research-projects`} className="w-full">
              <Button
                variant="outline"
                className="w-full flex justify-between items-center"
              >
                Manage Projects
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Contributions */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-1" style={{ backgroundColor: "#7c3aed" }} />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {facultyInfo.total_contributions}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Academic contributions across categories
            </p>
          </CardContent>
          <CardFooter>
            <Link href={`/faculty/contributions`} className="w-full">
              <Button
                variant="outline"
                className="w-full flex justify-between items-center"
              >
                Manage Contributions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Workshops & Conferences */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-1" style={{ backgroundColor: "#f59e0b" }} />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              Workshops & Conferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {facultyInfo.workshops_attended}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Events attended or organized
            </p>
          </CardContent>
          <CardFooter>
            <Link href={`/faculty/workshops`} className="w-full">
              <Button
                variant="outline"
                className="w-full flex justify-between items-center"
              >
                Manage Events
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Professional Memberships */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-1" style={{ backgroundColor: "#dc2626" }} />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-red-600" />
              Professional Memberships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {facultyInfo.professional_memberships}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Organizations and society memberships
            </p>
          </CardContent>
          <CardFooter>
            <Link href={`/faculty/memberships`} className="w-full">
              <Button
                variant="outline"
                className="w-full flex justify-between items-center"
              >
                Manage Memberships
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Awards & Recognitions */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-1" style={{ backgroundColor: "#0ea5e9" }} />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-sky-600" />
              Awards & Recognitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{facultyInfo.awards}</p>
            <p className="text-sm text-gray-500 mt-1">
              Honors and recognitions received
            </p>
          </CardContent>
          <CardFooter>
            <Link href={`/faculty/awards`} className="w-full">
              <Button
                variant="outline"
                className="w-full flex justify-between items-center"
              >
                Manage Awards
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function FacultyModulesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Faculty info header skeleton */}
      <Card className="overflow-hidden">
        <div className="h-2 bg-gray-200" />
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72 mt-2" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3 mt-2" />
        </CardContent>
      </Card>

      {/* Module Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-1 bg-gray-200" />
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
