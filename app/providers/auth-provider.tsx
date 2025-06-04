"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

// Define user roles
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
  departmentId?: number;
  permissions: string[];
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (
    username: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/logout",
  "/unauthorized",
];

// Define role-based route access with more specific paths
const roleAccess: Record<string, UserRole[]> = {
  "/dashboard": ["admin", "hod", "faculty", "staff", "student"],
  "/faculty": ["admin", "hod", "faculty", "staff", "student"],
  "/faculty/add": ["admin", "hod", "faculty"],
  "/faculty/edit": ["admin", "hod", "faculty"],
  "/faculty/details": ["admin", "hod", "faculty"],
  "/faculty/modules": ["faculty"],
  "/faculty/contributions": ["admin", "hod", "faculty"],
  "/faculty/publications": ["admin", "hod", "faculty"],
  "/faculty/memberships": ["admin", "hod", "faculty"],
  "/faculty/achievements": ["admin", "hod", "faculty"],
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

        // First check if we have a user in sessionStorage
        const storedUser = sessionStorage.getItem("authUser");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log("Found user in sessionStorage:", parsedUser.email);
            setUser(parsedUser);
            setLoading(false);
            return;
          } catch (parseError) {
            console.error("Error parsing stored user:", parseError);
            sessionStorage.removeItem("authUser");
          }
        }

        // Check auth_status cookie
        const cookies = document.cookie.split(";");
        const hasAuthStatus = cookies.some((cookie) =>
          cookie.trim().startsWith("auth_status=")
        );

        if (!hasAuthStatus) {
          console.log("No auth_status cookie found, user is not logged in");
          setUser(null);
          setLoading(false);
          return;
        }

        // Verify with server
        console.log("Verifying authentication with server...");
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        // Check for non-JSON response
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error(
            "Non-JSON response from /api/auth/me endpoint:",
            await response.text()
          );
          setUser(null);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            console.log(
              "Authentication verified successfully for:",
              data.user.email
            );
            setUser(data.user);
            // Store in sessionStorage for redundancy
            sessionStorage.setItem("authUser", JSON.stringify(data.user));
          } else {
            console.log("API returned success=false or no user data");
            setUser(null);
            sessionStorage.removeItem("authUser");
          }
        } else {
          console.error(
            "Authentication verification failed with status:",
            response.status
          );
          setUser(null);
          sessionStorage.removeItem("authUser");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
        sessionStorage.removeItem("authUser");
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

    // If not authenticated, redirect to login
    if (!user) {
      // Use window.location.origin for reliable base URL in all environments
      const baseUrl = window.location.origin;

      window.location.href = `${baseUrl}/login?redirect=${encodeURIComponent(
        pathname
      )}`;
      return;
    }

    // Check access permissions based on path segments
    const pathParts = pathname.split("/").filter(Boolean);
    const basePath = `/${pathParts[0]}`;
    const subPath =
      pathParts.length > 1 ? `/${pathParts[0]}/${pathParts[1]}` : null;

    // Find the most specific path match in roleAccess
    let allowedRoles: UserRole[] = ["admin"];

    if (subPath && roleAccess[subPath]) {
      // Check if there's a specific access rule for the subpath (e.g., /faculty/add)
      allowedRoles = roleAccess[subPath];
    } else if (roleAccess[basePath]) {
      // Fallback to base path access rules (e.g., /faculty)
      allowedRoles = roleAccess[basePath];
    } // Check if the user's role is allowed for this path
    if (!allowedRoles.includes(user.role)) {
      console.log(`User role ${user.role} not permitted to access ${pathname}`);

      // Use window.location.origin for reliable base URL in all environments
      const baseUrl = window.location.origin;

      window.location.href = `${baseUrl}/unauthorized`;
    }
  }, [user, loading, pathname]);

  const login = async (
    username: string, // Changed from email to username to match the API
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Login attempt for:", username); // Changed from email to username

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // Make sure cookies are included
        credentials: "include",
        body: JSON.stringify({ username, password, rememberMe }), // Changed from email to username
      });

      // Check for non-JSON response
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error(
          "Non-JSON response from /api/auth/login endpoint:",
          await response.text()
        );
        throw new Error("Server error: Invalid response format");
      }

      const data = await response.json();
      console.log(
        "Login response:",
        data.success ? "Success" : "Failed",
        data.success ? `User role: ${data.user.role}` : `Error: ${data.message}`
      );

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Clear any old error state
      setError(null);

      // Set the user data from response
      setUser(data.user);

      // Ensure auth state is stored in sessionStorage as well for redundancy
      sessionStorage.setItem("authUser", JSON.stringify(data.user));

      // Return the user data
      return data.user;
    } catch (err) {
      console.error("Login error details:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Call the logout API
      await fetch("/api/auth/logout", { method: "POST" });

      // Clear all auth data
      setUser(null);
      sessionStorage.removeItem("authUser");
      localStorage.removeItem("session_token");

      // Clear cookies manually as well
      document.cookie =
        "session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie =
        "auth_status=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"; // Use window.location.origin for reliable base URL in all environments
      const baseUrl = window.location.origin;

      // Redirect to login page
      window.location.href = `${baseUrl}/login`;
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if the API call fails, clear auth data on the client
      setUser(null);
      sessionStorage.removeItem("authUser"); // Redirect to login page anyway using origin
      const baseUrl = window.location.origin;
      window.location.href = `${baseUrl}/login`;
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!user) return false;

    // Admin has all permissions
    if (user.role === "admin") return true;

    // HOD has department-specific permissions
    if (
      user.role === "hod" &&
      (permission.startsWith("department_") ||
        permission.startsWith("faculty_") ||
        permission.startsWith("course_"))
    ) {
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
