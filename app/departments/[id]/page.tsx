"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/app/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Globe, Mail, Phone, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getDepartmentStyle } from "@/app/lib/theme";
import Link from "next/link";
import { use } from "react";
import { useAuth } from "@/app/providers/auth-provider";

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
  Notable_Achievements: string;
  Industry_Collaboration: string;
  Research_Focus_Area: string;
  HOD: {
    id: number;
    name: string;
  } | null;
}

export default function DepartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { user } = useAuth();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Restrict department users to only their own department
  if (user && user.role === "department" && user.departmentId !== Number(id)) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-4">You do not have permission to view this department.</p>
            <Button variant="outline" onClick={() => router.push("/departments")} className="mt-6">Back to Departments</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  useEffect(() => {
    // First check user's role
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
    fetchDepartmentData();
  }, [id]);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/departments/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch department data");
      }
      
      const data = await response.json();
      setDepartment(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching department:", err);
      setError(err instanceof Error ? err.message : "Failed to load department");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/departments");
  };

  // Check if user can edit department
  const canEditDepartment = userRole === "admin";

  if (loading) {
    return (
      <MainLayout>
        <div className="mb-6 flex items-center">
          <Button variant="outline" onClick={handleBack} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 animate-pulse">
              <Skeleton className="h-7 w-48 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
            
            <Card className="p-6 animate-pulse">
              <Skeleton className="h-7 w-48 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="p-6 animate-pulse">
              <Skeleton className="h-7 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
            
            <Card className="p-6 animate-pulse">
              <Skeleton className="h-7 w-32 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Button variant="outline" onClick={handleBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Departments
        </Button>
        <Card className="p-6 border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </Card>
      </MainLayout>
    );
  }

  if (!department) {
    return (
      <MainLayout>
        <Button variant="outline" onClick={handleBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Departments
        </Button>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Department Not Found</h2>
          <p className="text-gray-600">
            The requested department could not be found. It may have been deleted or you may not have permission to view it.
          </p>
        </Card>
      </MainLayout>
    );
  }

  const departmentStyle = getDepartmentStyle(department.Department_Name);

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button variant="outline" onClick={handleBack} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">{department.Department_Name}</h1>
        </div>
        
        {canEditDepartment && (
          <Link href={`/departments/edit/${department.Department_ID}`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" /> Edit Department
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - left side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department overview */}
          <Card>
            <div 
              className="h-2 w-full" 
              style={{ backgroundColor: departmentStyle.primary }}
            />
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-semibold"
                  style={{ backgroundColor: departmentStyle.primary }}
                >
                  {department.Department_Name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{department.Department_Name}</h2>
                  {department.Department_Code && (
                    <p className="text-gray-500">Code: {department.Department_Code}</p>
                  )}
                  {department.Establishment_Year && (
                    <p className="text-gray-500">Established: {department.Establishment_Year}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-6">
                <div className="flex items-start">
                  <Users className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-700">Faculty & student</p>
                    <p className="text-gray-600">
                      {department.Total_Faculty || '0'} faculty members, {department.Total_Students || '0'} student
                    </p>
                  </div>
                </div>
                
                {department.HOD && (
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">Head of Department</p>
                      <p className="text-gray-600">{department.HOD.name}</p>
                    </div>
                  </div>
                )}
                
                {department.Email_ID && (
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">Email</p>
                      <p className="text-gray-600">{department.Email_ID}</p>
                    </div>
                  </div>
                )}
                
                {department.Department_Phone_Number && (
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">Phone</p>
                      <p className="text-gray-600">{department.Department_Phone_Number}</p>
                    </div>
                  </div>
                )}
                
                {department.Website_URL && (
                  <div className="flex items-start">
                    <Globe className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">Website</p>
                      <a 
                        href={department.Website_URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {department.Website_URL}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Vision and Mission */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Vision & Mission</h2>
            
            {department.Vision ? (
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-2">Vision</h3>
                <p className="text-gray-700">{department.Vision}</p>
              </div>
            ) : (
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-2">Vision</h3>
                <p className="text-gray-500 italic">No vision statement available</p>
              </div>
            )}
            
            {department.Mission ? (
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Mission</h3>
                <p className="text-gray-700">{department.Mission}</p>
              </div>
            ) : (
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Mission</h3>
                <p className="text-gray-500 italic">No mission statement available</p>
              </div>
            )}
          </Card>

          {/* Research Focus Areas */}
          {department.Research_Focus_Area && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Research Focus Areas</h2>
              <p className="text-gray-700">{department.Research_Focus_Area}</p>
            </Card>
          )}
        </div>

        {/* Sidebar - right side */}
        <div className="space-y-6">
          {/* Achievements */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Notable Achievements</h2>
            {department.Notable_Achievements ? (
              <p className="text-gray-700">{department.Notable_Achievements}</p>
            ) : (
              <p className="text-gray-500 italic">No achievements listed</p>
            )}
          </Card>

          {/* Industry Collaborations */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Industry Collaborations</h2>
            {department.Industry_Collaboration ? (
              <p className="text-gray-700">{department.Industry_Collaboration}</p>
            ) : (
              <p className="text-gray-500 italic">No industry collaborations listed</p>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 