// app/components/auth/PermissionGate.tsx
"use client";

import { ReactNode } from "react";
import { useAuth } from "@/app/providers/auth-provider";

interface PermissionGateProps {
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * PermissionGate - Component to conditionally render content based on user permissions
 * 
 * @param resource - The resource being accessed (e.g., "faculty", "department")
 * @param action - The action being performed (e.g., "read", "create", "update", "delete")
 * @param children - Content to show if user has permission
 * @param fallback - Optional content to show if user doesn't have permission
 */
export default function PermissionGate({
  resource,
  action,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { user, checkPermission } = useAuth();
  
  // Check if the user is authenticated
  if (!user) {
    return fallback;
  }
  
  // Check for the specific permission
  const permissionName = `${resource}_${action}`;
  const hasPermission = checkPermission(permissionName);
  
  // Render the content or fallback based on permission
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
