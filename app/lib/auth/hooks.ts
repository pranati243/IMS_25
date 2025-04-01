// app/lib/auth/hooks.ts
"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";
import { hasPermission } from "./permissions";

// Hook to protect routes
export function useAuth({
  required = true,
  role = null,
  resource = null,
  action = null,
  redirectTo = "/login",
} = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated but authentication is required
    if (!isAuthenticated && required) {
      router.push(
        `${redirectTo}?callbackUrl=${encodeURIComponent(window.location.href)}`
      );
      return;
    }

    // Check role if specified
    if (isAuthenticated && role && session?.user?.role !== role) {
      router.push("/unauthorized");
      return;
    }

    // Check permission if resource and action are specified
    if (
      isAuthenticated &&
      resource &&
      action &&
      !hasPermission(session.user.role, resource, action)
    ) {
      router.push("/unauthorized");
      return;
    }
  }, [
    isLoading,
    isAuthenticated,
    required,
    role,
    resource,
    action,
    redirectTo,
    router,
    session,
  ]);

  return {
    session,
    status,
    isLoading,
    isAuthenticated,
  };
}

// Hook to check if user has specific permissions
export function usePermission(resource: string, action: string) {
  const { data: session } = useSession();

  if (!session?.user?.role) {
    return false;
  }

  return hasPermission(session.user.role, resource, action);
}
