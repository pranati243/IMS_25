"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call our custom logout endpoint
        const response = await fetch("/api/auth/logout", { method: "POST" });
        if (!response.ok) {
          throw new Error("Logout failed");
        }

        // Clear all authentication data
        document.cookie =
          "session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie =
          "auth_status=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        localStorage.removeItem("session_token");
        sessionStorage.removeItem("authUser");

        // Redirect to login page
        router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);

        // Clear any remaining session data just in case
        document.cookie =
          "session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie =
          "auth_status=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        localStorage.removeItem("session_token");
        sessionStorage.removeItem("authUser");

        // Redirect to login page
        router.push("/login");
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Logging out...
        </h1>
        <p className="text-gray-500">Please wait while we sign you out.</p>
      </div>
    </div>
  );
}
