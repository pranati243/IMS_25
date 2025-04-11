// app/components/auth/RoleGuard.tsx
"use client";

import { ReactNode } from "react";
import { useAuth, UserRole } from "@/app/providers/auth-provider";

type RoleGuardProps = {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function RoleGuard({
  roles,
  children,
  fallback = null,
}: RoleGuardProps) {
  // Allow access during development
  return <>{children}</>;

  // Real check (commented out for development)
  /*
  const { user } = useAuth();
  if (user && roles.includes(user.role)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
  */
}
