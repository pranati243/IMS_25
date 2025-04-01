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

  // Check permission if resource and action are specified
  if (
    session &&
    resource &&
    action &&
    !hasPermission(session.user.role, resource, action)
  ) {
    redirect("/unauthorized");
  }

  return session;
}
