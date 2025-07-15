"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getDepartmentStyle } from "@/app/lib/theme";
import { useRouter } from "next/navigation";

interface Department {
  Department_ID: number;
  Department_Name: string;
  Establishment_Year: number | null;
  Department_Code: string;
  Email_ID: string;
  Department_Phone_Number: string;
  HOD_ID: number | null;
  Vision: string;
  Mission: string;
  Total_Faculty: number;
  Total_Students: number;
  Website_URL: string;
  HOD: {
    id: number;
    name: string;
  } | null;
}

export default function DepartmentsPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [establishmentYearFilter, setEstablishmentYearFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("name");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check user's role from auth API
    const fetchUserRole = async () => {
      try {
        const response = await fetch("/api/auth/me");

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUserRole(data.user.role);
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
    fetchDepartments();
  }, []);

  // Apply filters locally
  useEffect(() => {
    let result = [...departments];

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.Department_Name.toLowerCase().includes(searchLower) ||
          (d.Department_Code && d.Department_Code.toLowerCase().includes(searchLower))
      );
    }

    // Filter by establishment year
    if (establishmentYearFilter && establishmentYearFilter !== "all") {
      if (establishmentYearFilter === "before-2000") {
        result = result.filter((d) => d.Establishment_Year && d.Establishment_Year < 2000);
      } else if (establishmentYearFilter === "2000-2010") {
        result = result.filter((d) => d.Establishment_Year && d.Establishment_Year >= 2000 && d.Establishment_Year <= 2010);
      } else if (establishmentYearFilter === "after-2010") {
        result = result.filter((d) => d.Establishment_Year && d.Establishment_Year > 2010);
      }
    }

    // Sort the results
    result = sortDepartments(result, sortOrder);

    setFilteredDepartments(result);
  }, [departments, search, establishmentYearFilter, sortOrder]);

  const sortDepartments = (depts: Department[], order: string) => {
    return [...depts].sort((a, b) => {
      switch (order) {
        case "name":
          return a.Department_Name.localeCompare(b.Department_Name);
        case "establishment-asc":
          if (!a.Establishment_Year) return 1;
          if (!b.Establishment_Year) return -1;
          return a.Establishment_Year - b.Establishment_Year;
        case "establishment-desc":
          if (!a.Establishment_Year) return 1;
          if (!b.Establishment_Year) return -1;
          return b.Establishment_Year - a.Establishment_Year;
        case "faculty-count":
          return (b.Total_Faculty || 0) - (a.Total_Faculty || 0);
        case "student-count":
          return (b.Total_Students || 0) - (a.Total_Students || 0);
        default:
          return a.Department_Name.localeCompare(b.Department_Name);
      }
    });
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/departments");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      setDepartments(data.data);
      setFilteredDepartments(data.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch department data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Get unique establishment years from department data
  const establishmentYears = Array.from(
    new Set(
      departments
        .filter((d) => d.Establishment_Year)
        .map((d) => d.Establishment_Year)
    )
  ).sort();

  // Check if any filters are active
  const hasActiveFilters =
    search !== "" ||
    (establishmentYearFilter !== "" && establishmentYearFilter !== "all");

  // Check if user has permission to add/edit departments
  const canManageDepartments = userRole === "admin";

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Department Directory
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Browse and search departments
            </p>
          </div>
          {canManageDepartments && (
            <Link href="/departments/add">
              <Button className="flex items-center gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                Add Department
              </Button>
            </Link>
          )}
        </div>

        {/* Search and filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name or department code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-full"
              />
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
                    <label className="text-sm font-medium">Establishment Year</label>
                    <Select
                      value={establishmentYearFilter}
                      onValueChange={setEstablishmentYearFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Year</SelectItem>
                        <SelectItem value="before-2000">Before 2000</SelectItem>
                        <SelectItem value="2000-2010">2000-2010</SelectItem>
                        <SelectItem value="after-2010">After 2010</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Sort by dropdown */}
            <Select
              value={sortOrder}
              onValueChange={setSortOrder}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="establishment-asc">Establishment Year (Oldest First)</SelectItem>
                <SelectItem value="establishment-desc">Establishment Year (Newest First)</SelectItem>
                <SelectItem value="faculty-count">Faculty Count</SelectItem>
                <SelectItem value="student-count">Student Count</SelectItem>
              </SelectContent>
            </Select>
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

              {establishmentYearFilter && establishmentYearFilter !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Year:{" "}
                  {establishmentYearFilter === "before-2000"
                    ? "Before 2000"
                    : establishmentYearFilter === "2000-2010"
                    ? "2000-2010"
                    : "After 2010"}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setEstablishmentYearFilter("all")}
                  />
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-xs"
                onClick={() => {
                  setSearch("");
                  setEstablishmentYearFilter("all");
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </Card>

        {/* Departments list */}
        <div className="min-h-[300px]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-2 bg-gray-200" />
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-500 p-6 rounded-md">
              <p className="font-medium">Error loading department data</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="text-center py-12 border rounded-md">
              <p className="text-gray-500 font-medium">
                No departments found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your filters
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setEstablishmentYearFilter("");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">
                  Showing {filteredDepartments.length} of {departments.length} departments
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDepartments.map((department) => (
                  <DepartmentCard
                    key={department.Department_ID}
                    department={department}
                    showEditButton={canManageDepartments}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

interface DepartmentCardProps {
  department: Department;
  showEditButton?: boolean;
}

function DepartmentCard({ department, showEditButton = false }: DepartmentCardProps) {
  const router = useRouter();
  const departmentStyle = getDepartmentStyle(department.Department_Name);

  const handleClick = () => {
    router.push(`/departments/${department.Department_ID}`);
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:shadow-md" 
      onClick={handleClick}
    >
      <div
        className="h-2"
        style={{ backgroundColor: departmentStyle.primary }}
      />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium text-gray-900">
              {department.Department_Name}
            </h3>
            {department.Department_Code && (
              <p className="text-sm text-gray-500">
                Code: {department.Department_Code}
              </p>
            )}
            {department.Establishment_Year && (
              <p className="text-sm text-gray-500">
                Est. {department.Establishment_Year}
              </p>
            )}
            {department.HOD && (
              <p className="text-sm font-medium text-indigo-600 mt-1">
                HOD: {department.HOD.name}
              </p>
            )}
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0"
            style={{ backgroundColor: departmentStyle.primary }}
          >
            {department.Department_Name.charAt(0)}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {department.Email_ID && (
            <div className="flex">
              <span className="w-20 flex-shrink-0 text-gray-500">Email:</span>
              <span className="text-gray-700 truncate">{department.Email_ID}</span>
            </div>
          )}
          {department.Department_Phone_Number && (
            <div className="flex">
              <span className="w-20 flex-shrink-0 text-gray-500">Phone:</span>
              <span className="text-gray-700">{department.Department_Phone_Number}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-2 border-t border-gray-100 text-xs">
          <div className="text-blue-600">
            <span className="font-semibold">{department.Total_Faculty || 0}</span>{" "}
            faculty members
          </div>
          <div className="text-purple-600">
            <span className="font-semibold">{department.Total_Students || 0}</span>{" "}
            student
          </div>
        </div>

        {showEditButton && (
          <div className="pt-2 flex justify-end" onClick={(e) => e.stopPropagation()}>
            <Link href={`/departments/edit/${department.Department_ID}`}>
              <Button size="sm" variant="outline" className="text-xs">
                Edit Department
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
} 