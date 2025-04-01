"use client";

import { useAuth } from "@/app/providers/auth-provider";
import { ReactNode } from "react";

type PermissionGuardProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { checkPermission } = useAuth();

  if (checkPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
