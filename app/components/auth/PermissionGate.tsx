// app/components/auth/PermissionGate.tsx
"use client";

import { useAuth } from "@/app/providers/auth-provider";
import { ReactNode } from "react";

type PermissionGateProps = {
  resource?: string;
  action?: string;
  permission?: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export default function PermissionGate({
  resource,
  action,
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { checkPermission } = useAuth();

  // If no permission specified, allow access
  if (!permission && (!resource || !action)) {
    return <>{children}</>;
  }

  // Allow access during development (always return true)
  return <>{children}</>;

  // This is the real check (commented out for development)
  /*
  const permToCheck = permission || `${resource}_${action}`;
  if (checkPermission(permToCheck)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
  */
}
