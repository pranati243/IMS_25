"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddFacultyForm } from "@/components/faculty/AddFacultyForm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface FacultyData {
  F_id: number;
  F_name: string;
  F_dept: string;
  Email: string;
  Phone_Number: string;
  PAN_Number: string;
  Aadhaar_Number: string;
  Highest_Degree: string;
  Area_of_Certification: string;
  Date_of_Joining: string;
  Experience: number;
  Past_Experience: string;
  Age: number;
  Current_Designation: string;
  Date_of_Birth: string;
  Nature_of_Association: string;
}

export default function EditFacultyPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [facultyData, setFacultyData] = useState<FacultyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);

  // Function to run the debug test API
  const runDebugTest = async () => {
    try {
      toast.info("Running faculty update test...");
      const response = await fetch('/api/debug/faculty-edit-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ facultyId: parseInt(params.id) }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Debug test successful! Refresh to see changes.");
        console.log("Debug test result:", data);
      } else {
        toast.error(`Debug test failed: ${data.message}`);
        console.error("Debug test error:", data);
      }
    } catch (err) {
      console.error("Error running debug test:", err);
      toast.error("Failed to run debug test");
    }
  };

  // Delete faculty handler
  const handleDelete = async () => {
    if (!facultyData) return;
    if (!window.confirm(`Are you sure you want to delete faculty: ${facultyData.F_name}? This action cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/faculty/${facultyData.F_id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Faculty deleted successfully');
        router.push('/faculty');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete faculty');
      }
    } catch (err) {
      toast.error('Failed to delete faculty');
    }
  };

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/faculty/${params.id}`);
        
        if (!response.ok) {
          // Try to get the error message
          let errorMsg = "Failed to fetch faculty data";
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          } catch (e) {
            // If we can't parse the error, use the default message
          }
          
          throw new Error(errorMsg);
        }
        
        const data = await response.json();

        // Convert date strings to Date objects if they exist
        const formattedData = {
          ...data,
          Date_of_Joining: data.Date_of_Joining ? new Date(data.Date_of_Joining) : null,
          Date_of_Birth: data.Date_of_Birth ? new Date(data.Date_of_Birth) : null,
        };

        setFacultyData(formattedData);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
        toast.error("Failed to load faculty data");
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [params.id]);

  const handleClose = () => {
    router.push("/faculty");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Faculty</h1>
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
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Faculty</h1>
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
              Return to Faculty List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!facultyData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Faculty</h1>
            <Button variant="outline" onClick={handleClose} className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-red-500">Faculty not found or data is incomplete</p>
            <Button variant="outline" onClick={handleClose} className="mt-4">
              Return to Faculty List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Faculty: {facultyData.F_name}</h1>
          <div className="flex space-x-2">
            {/* Debug button - only shown in development */}
            {process.env.NODE_ENV !== 'production' && (
              <Button 
                variant="outline" 
                onClick={() => setDebugMode(!debugMode)}
                className="text-amber-600 border-amber-300 hover:bg-amber-50"
              >
                {debugMode ? "Hide Debug" : "Debug Mode"}
              </Button>
            )}
            <Button onClick={handleDelete} className="ml-2 bg-black text-white hover:bg-gray-900">
              Delete Faculty
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </div>
        </div>
        
        {debugMode && (
          <div className="mb-6 p-4 border border-amber-300 bg-amber-50 rounded-lg">
            <h3 className="text-amber-800 font-medium mb-2">Debug Tools</h3>
            <p className="text-amber-700 mb-3">Use these tools to diagnose submission issues</p>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={runDebugTest}
                className="text-amber-700 border-amber-400 hover:bg-amber-100"
              >
                Test Faculty Update
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => window.location.reload(), 500);
                }}
                className="text-amber-700 border-amber-400 hover:bg-amber-100"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        )}
        
        <AddFacultyForm
          onClose={handleClose}
          initialData={facultyData}
          isEditing={true}
          facultyId={parseInt(params.id)}
        />
      </div>
    </div>
  );
} 