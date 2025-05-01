"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DepartmentForm } from "@/components/department/DepartmentForm";

export default function AddDepartmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check user role for authorization
    const checkUserRole = async () => {
      try {
        const response = await fetch("/api/auth/me");
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            // Only admins can add departments
            if (data.user.role !== "admin") {
              setError("You don't have permission to add departments");
              setLoading(false);
              return;
            }
            setLoading(false);
            return;
          }
        }
        setError("Unauthorized access");
        setLoading(false);
      } catch (error) {
        console.error("Error checking authorization:", error);
        setError("Authentication error");
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  const handleClose = () => {
    router.push("/departments");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Add New Department</h1>
              <Button variant="outline" onClick={handleClose} className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Add New Department</h1>
              <Button variant="outline" onClick={handleClose} className="flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </div>
            
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
              <p className="text-red-600">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4 text-red-600 border-red-300 hover:bg-red-50"
                onClick={handleClose}
              >
                Return to Department List
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Add New Department</h1>
            <Button variant="outline" onClick={handleClose} className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </div>
          
          <DepartmentForm 
            onClose={handleClose}
            isEditing={false}
          />
        </div>
      </div>
    </MainLayout>
  );
} 