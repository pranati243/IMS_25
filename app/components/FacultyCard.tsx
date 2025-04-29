import { getDepartmentStyle } from "@/app/lib/theme";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";

interface FacultyCardProps {
  faculty: {
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
  };
  showEditButton?: boolean;
}

export function FacultyCard({
  faculty,
  showEditButton = true,
}: FacultyCardProps) {
  const departmentStyle = getDepartmentStyle(faculty.F_dept);

  return (
    <Card className="overflow-hidden">
      <div
        className="h-2"
        style={{ backgroundColor: departmentStyle.primary }}
      />
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0"
              style={{ backgroundColor: departmentStyle.primary }}
            >
              {faculty.F_name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              {" "}
              {/* This ensures text wrapping */}
              <h3 className="font-medium text-gray-900 truncate">
                {faculty.F_name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {faculty.Current_Designation}
              </p>
              <div
                className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: departmentStyle.light,
                  color: departmentStyle.dark,
                }}
              >
                {faculty.F_dept}
              </div>
            </div>
          </div>
          {showEditButton && (
            <Link href={`/faculty/edit/${faculty.F_id}`}>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="w-20 flex-shrink-0 text-gray-500">Email:</span>
            <span className="text-gray-700 truncate">{faculty.Email}</span>
          </div>
          <div className="flex">
            <span className="w-20 flex-shrink-0 text-gray-500">Phone:</span>
            <span className="text-gray-700">{faculty.Phone_Number}</span>
          </div>
          <div className="flex">
            <span className="w-20 flex-shrink-0 text-gray-500">Education:</span>
            <span className="text-gray-700 truncate">
              {faculty.Highest_Degree}
            </span>
          </div>
          <div className="flex">
            <span className="w-20 flex-shrink-0 text-gray-500">
              Experience:
            </span>
            <span className="text-gray-700">{faculty.Experience} years</span>
          </div>
        </div>

        <div className="flex justify-between pt-2 border-t border-gray-100 text-xs">
          <div className="text-blue-600">
            <span className="font-semibold">{faculty.total_contributions}</span>{" "}
            contributions
          </div>
          <div className="text-purple-600">
            <span className="font-semibold">
              {faculty.professional_memberships}
            </span>{" "}
            memberships
          </div>
        </div>
      </div>
    </Card>
  );
}
