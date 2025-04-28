"use client";

import React, { ReactNode, useEffect, useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function AdminDatabaseLayout({ children }: LayoutProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // In a real app, you would check for admin role
  // For demo purposes, we use a simple password
  const checkAuthorization = async () => {
    // Check for "dev mode" query param or localStorage auth token
    const isDevMode =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("devmode");

    const storedAuth =
      typeof window !== "undefined" && localStorage.getItem("db_admin_auth");

    if (isDevMode || storedAuth) {
      setIsAuthorized(true);
      if (isDevMode) {
        // Store auth in localStorage so the user doesn't have to use the query param again
        localStorage.setItem("db_admin_auth", "true");
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    checkAuthorization();
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple demonstration password - in production, use proper authentication
    if (password === "demo123") {
      setIsAuthorized(true);
      localStorage.setItem("db_admin_auth", "true");
    } else {
      setError("Invalid password");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Database Inspector
          </h1>

          <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-md text-yellow-700 text-sm mb-6">
            <p className="font-semibold">⚠️ Restricted Area</p>
            <p>
              This database inspector is for authorized personnel only. For demo
              purposes, use the password: <strong>demo123</strong>
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth}>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter access password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Access Database Inspector
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
}
