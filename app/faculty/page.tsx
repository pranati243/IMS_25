"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import { FacultyCard } from "@/app/components/FacultyCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
// import { getDepartmentStyle } from "@/app/lib/theme";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Faculty {
  F_id: number;
  F_name: string;
  F_dept: string;
  Email: string;
  Phone_Number: string;
  Current_Designation: string;
  Highest_Degree: string;
  Experience: number;
  total_contributions: number;
  professional_memberships: number;
}

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<string>("");
  const [designation, setDesignation] = useState<string>("");
  const [experienceFilter, setExperienceFilter] = useState<string>("");

  useEffect(() => {
    fetchFaculty();
  }, []);

  // Apply filters locally
  useEffect(() => {
    let result = [...faculty];

    // Filter by department
    if (department && department !== "all") {
      result = result.filter((f) => f.F_dept === department);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.F_name.toLowerCase().includes(searchLower) ||
          f.Email.toLowerCase().includes(searchLower) ||
          f.Current_Designation.toLowerCase().includes(searchLower)
      );
    }

    // Filter by designation
    if (designation) {
      result = result.filter((f) => f.Current_Designation === designation);
    }

    // Filter by experience
    if (designation && designation !== "all") {
      result = result.filter((f) => f.Current_Designation === designation);
    }

    // Filter by experience
    if (experienceFilter && experienceFilter !== "all") {
      if (experienceFilter === "0-5") {
        result = result.filter((f) => f.Experience >= 0 && f.Experience <= 5);
      } else if (experienceFilter === "6-10") {
        result = result.filter((f) => f.Experience >= 6 && f.Experience <= 10);
      } else if (experienceFilter === "11-15") {
        result = result.filter((f) => f.Experience >= 11 && f.Experience <= 15);
      } else if (experienceFilter === "15+") {
        result = result.filter((f) => f.Experience > 15);
      }
    }

    setFilteredFaculty(result);
  }, [faculty, search, department, designation, experienceFilter]);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/faculty`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setFaculty(data.data);
      setFilteredFaculty(data.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch faculty data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Get unique departments from faculty data
  const departments = Array.from(new Set(faculty.map((f) => f.F_dept))).sort();

  // Get unique designations from faculty data
  const designations = Array.from(
    new Set(faculty.map((f) => f.Current_Designation))
  ).sort();

  // Check if any filters are active
  const hasActiveFilters =
    (department !== "" && department !== "all") ||
    search !== "" ||
    (designation !== "" && designation !== "all") ||
    (experienceFilter !== "" && experienceFilter !== "all");

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Faculty Directory
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Browse and search faculty members across all departments
            </p>
          </div>
          <Link href="/faculty/add">
            <Button className="flex items-center gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              Add Faculty
            </Button>
          </Link>
        </div>

        {/* Search and filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, email, or designation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-full"
              />
            </div>

            {/* Department filter as a prominent select */}
            <div className="w-full sm:w-auto">
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced filters in a popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter by</h4>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Designation</label>
                    <Select value={designation} onValueChange={setDesignation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Designation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Designation</SelectItem>
                        {designations.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Experience</label>
                    <Select
                      value={experienceFilter}
                      onValueChange={setExperienceFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Experience</SelectItem>
                        <SelectItem value="0-5">0-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="11-15">11-15 years</SelectItem>
                        <SelectItem value="15+">15+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
              <span className="text-sm text-gray-500 mt-1">
                Active filters:
              </span>

              {search && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search:{" "}
                  {search.length > 15 ? search.slice(0, 15) + "..." : search}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setSearch("")}
                  />
                </Badge>
              )}

              {department && department !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Department: {department}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setDepartment("")}
                  />
                </Badge>
              )}

              {designation && designation !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Designation: {designation}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setDesignation("all")}
                  />
                </Badge>
              )}

              {experienceFilter && experienceFilter !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Experience:{" "}
                  {experienceFilter === "15+"
                    ? "15+ years"
                    : `${experienceFilter} years`}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setExperienceFilter("all")}
                  />
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-xs"
                onClick={() => {
                  setSearch("");
                  setDepartment("all");
                  setDesignation("all");
                  setExperienceFilter("all");
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </Card>

        {/* Faculty list with department color indicators */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-2 bg-gray-200" />
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-500 p-6 rounded-md">
              <p className="font-medium">Error loading faculty data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="text-center py-12 border rounded-md">
              <p className="text-gray-500 font-medium">
                No faculty members found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your filters
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setDepartment("");
                  setDesignation("");
                  setExperienceFilter("");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                  Showing {filteredFaculty.length} of {faculty.length} faculty
                  members
                </p>

                <Select defaultValue="name">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="department">
                      Sort by Department
                    </SelectItem>
                    <SelectItem value="experience-desc">
                      Experience (High to Low)
                    </SelectItem>
                    <SelectItem value="experience-asc">
                      Experience (Low to High)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFaculty.map((member) => (
                  <FacultyCard key={member.F_id} faculty={member} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
