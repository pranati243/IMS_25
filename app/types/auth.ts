// app/types/auth.ts
export type UserRole =
  | "admin"
  | "department_head"
  | "faculty"
  | "staff"
  | "student";

export type Permission = {
  resource: string;
  action: "create" | "read" | "update" | "delete" | "manage";
};

export type ResourcePermissions = {
  [resource: string]: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
    manage?: boolean;
  };
};

export interface UserPermissions {
  [key: string]: boolean;
}

// Extend next-auth types
declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    departmentId?: number;
    departmentName?: string;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    departmentId?: number;
    departmentName?: string;
  }
}
