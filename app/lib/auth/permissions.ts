// app/lib/auth/permissions.ts
import { ResourcePermissions, UserRole } from "@/app/types/auth";

// Define permissions for different user roles
export const rolePermissions: Record<UserRole, ResourcePermissions> = {
  admin: {
    faculty: { read: true, manage: false },
    student: { read: true, manage: false },
    department: { read: true, manage: false },
    course: { read: true, manage: false },
    announcement: { read: true, create: true, update: true, delete: true },
    dashboard: { read: true },
    report: { read: true, create: true },
    settings: { read: true, update: true },
  },
  department_head: {
    faculty: {
      read: true,
      create: true,
      update: true,
      delete: true,
      manage: true,
    },
    student: { read: true, create: true, update: true, delete: true },
    department: { read: true, update: true },
    course: { read: true, create: true, update: true, delete: true },
    announcement: { read: true, create: true, update: true, delete: true },
    dashboard: { read: true },
    report: { read: true, create: true },
    settings: { read: true },
  },
  faculty: {
    faculty: { read: true },
    student: { read: true },
    department: { read: true },
    course: { read: true, update: true },
    announcement: { read: true, create: true },
    dashboard: { read: true },
    report: { read: true, create: true },
    settings: { read: true },
  },
  staff: {
    faculty: { read: true },
    student: { read: true },
    department: { read: true },
    course: { read: true },
    announcement: { read: true },
    dashboard: { read: true },
    report: { read: true },
    settings: { read: true },
  },
  student: {
    faculty: { read: true },
    student: { read: false },
    department: { read: true },
    course: { read: true },
    announcement: { read: true },
    dashboard: { read: true },
    report: { read: false },
    settings: { read: false },
  },
};

// Utility function to check if a user role has permission
export function hasPermission(
  role: UserRole,
  resource: string,
  action: string
): boolean {
  if (!rolePermissions[role]) return false;

  const resourcePermissions = rolePermissions[role][resource];
  if (!resourcePermissions) return false;

  // Special case for 'manage' which implies all permissions
  if (resourcePermissions.manage) return true;

  return !!resourcePermissions[action as keyof typeof resourcePermissions];
}

// Function to get all permissions for a role
export function getRolePermissions(role: UserRole): string[] {
  const permissions: string[] = [];

  Object.entries(rolePermissions[role]).forEach(([resource, actions]) => {
    Object.entries(actions).forEach(([action, hasAccess]) => {
      if (hasAccess) {
        permissions.push(`${resource}:${action}`);
      }
    });
  });

  return permissions;
}
