// app/lib/auth/server.ts
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hasPermission } from "./permissions";

// Check authentication and permissions on the server
export async function checkAuth({
  required = true,
  role = null,
  resource = null,
  action = null,
  redirectTo = "/login",
} = {}) {
  const session = await getServerSession(authOptions);

  // Not authenticated but authentication is required
  if (!session && required) {
    redirect(redirectTo);
  }

  // Check role if specified
  if (session && role && session.user.role !== role) {
    redirect("/unauthorized");
  }

  // Special case handling for faculty and reports
  if (
    session &&
    session.user.role === "faculty" &&
    resource === "report" &&
    (action === "read" || action === "create")
  ) {
    // Faculty should be allowed to access reports as per permissions.ts
    return session;
  }

  // Check permission if resource and action are specified
  if (
    session &&
    resource &&
    action &&
    !hasPermission(session.user.role, resource, action)
  ) {
    console.log(
      `Permission denied for ${session.user.role} to ${action} ${resource}`
    );
    redirect("/unauthorized");
  }

  return session;
}
