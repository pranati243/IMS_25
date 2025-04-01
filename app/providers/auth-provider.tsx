// app/providers/auth-provider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

export type UserRole =
  | "admin"
  | "hod"
  | "faculty"
  | "staff"
  | "student"
  | "guest";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  department?: string;
  permissions: string[];
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/forgot-password"];

// Define role-based route access
const roleAccess: Record<string, UserRole[]> = {
  "/dashboard": ["admin", "hod", "faculty", "staff", "student"],
  "/faculty": ["admin", "hod", "faculty", "staff", "student"],
  "/students": ["admin", "hod", "faculty", "staff"],
  "/courses": ["admin", "hod", "faculty", "staff", "student"],
  "/departments": ["admin", "hod"],
  "/admin": ["admin"],
  "/settings": ["admin", "hod"],
  "/profile": ["admin", "hod", "faculty", "staff", "student"],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/me");

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Route protection
  useEffect(() => {
    if (loading) return;

    // Allow access to public routes
    if (publicRoutes.includes(pathname)) return;

    // Check if current route requires authentication
    const basePath = `/${pathname.split("/")[1]}`;
    const allowedRoles = roleAccess[basePath] || ["admin"];

    // If not authenticated, redirect to login
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // If authenticated but doesn't have required role, redirect to dashboard
    if (!allowedRoles.includes(user.role)) {
      router.push("/dashboard");
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUser(data.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!user) return false;

    // Admin has all permissions
    if (user.role === "admin") return true;

    // HOD has department-specific permissions
    if (user.role === "hod" && permission.startsWith("department_")) {
      return true;
    }

    // Check if user has specific permission
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
