// app/faculty/[id]/page.tsx
import { checkAuth } from "@/app/lib/auth/server";
import MainLayout from "@/app/components/layout/MainLayout";
import PermissionGate from "@/app/components/auth/PermissionGate";
import { Button } from "@/components/ui/button";
import { query } from "@/app/lib/db";

export default async function FacultyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Check if user is authenticated
  const session = await checkAuth({
    required: true,
    resource: "faculty",
    action: "read",
  });

  // Get faculty details
  const facultyData = await query("SELECT * FROM faculty WHERE F_id = ?", [
    params.id,
  ]);

  const faculty = facultyData[0];

  // Check if the current user is from the same department as the faculty
  const isSameDepartment =
    session.user.role === "department_head" &&
    session.user.departmentId === faculty.department_id;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Faculty Profile: {faculty.F_name}
          </h1>

          {/* Edit button - only visible to department heads of the same department */}
          <PermissionGate
            resource="faculty"
            action="update"
            fallback={isSameDepartment ? <Button>Edit Faculty</Button> : null}
          >
            <Button>Edit Faculty</Button>
          </PermissionGate>
        </div>

        {/* Faculty details */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Faculty information display */}
        </div>

        {/* Contributions - only visible to department heads and admins */}
        <PermissionGate resource="faculty" action="manage">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Performance Management
              </h3>
            </div>
            {/* Performance management tools */}
          </div>
        </PermissionGate>
      </div>
    </MainLayout>
  );
}
