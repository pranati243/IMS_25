"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddFacultyForm } from "@/components/faculty/AddFacultyForm";
import { toast } from "sonner";

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

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const response = await fetch(`/api/faculty/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch faculty data");
        }

        // Convert date strings to Date objects
        const formattedData = {
          ...data,
          Date_of_Joining: new Date(data.Date_of_Joining),
          Date_of_Birth: new Date(data.Date_of_Birth),
        };

        setFacultyData(formattedData);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
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

  if (!facultyData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-red-500">Faculty not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
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