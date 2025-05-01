"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import Link from "next/link";

export default function SimpleDashboardPage() {
  const { user, loading } = useAuth();
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [loadingDiag, setLoadingDiag] = useState(false);
  
  // Check API on load
  useEffect(() => {
    async function testApi() {
      setLoadingDiag(true);
      try {
        // Test the me endpoint
        const response = await fetch("/api/auth/me", {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        // Get cookies
        const cookies = document.cookie.split(';').map(c => c.trim());
        
        setDiagnostic({
          apiStatus: response.status,
          apiSuccess: data.success,
          userData: data.user,
          cookies,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        setDiagnostic({
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
      } finally {
        setLoadingDiag(false);
      }
    }
    
    if (!loading) {
      testApi();
    }
  }, [loading]);
  
  // Try bypass auth if needed
  const bypassAuth = async () => {
    try {
      setLoadingDiag(true);
      const response = await fetch("/api/debug/bypass-auth", {
        credentials: 'include'
      });
      
      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.json();
        alert("Bypass failed: " + data.message);
      }
    } catch (error) {
      alert("Error: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoadingDiag(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Loading...</h1>
          <p className="text-gray-500">Verifying your authentication</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Not Authenticated</h1>
          <p className="text-gray-500 mb-4">Please log in to access the dashboard</p>
          
          <div className="flex flex-col space-y-4">
            <Link 
              href="/login"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Login
            </Link>
            
            <button
              onClick={bypassAuth}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Try Auth Bypass (Dev Mode)
            </button>
          </div>
          
          {diagnostic && (
            <div className="mt-8 p-4 bg-gray-100 rounded text-left max-w-lg mx-auto text-xs overflow-auto">
              <h2 className="font-semibold mb-2">Diagnostic Info:</h2>
              <pre>{JSON.stringify(diagnostic, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Simple Dashboard</h1>
          <p className="text-gray-600 mb-2">
            Welcome back, <span className="font-semibold">{user.name || user.username}</span>!
          </p>
          <p className="text-gray-500 text-sm">
            Logged in as: {user.email} ({user.role})
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Authentication Status</h2>
          
          <div className="mb-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            >
              Refresh Page
            </button>
            
            <button
              onClick={bypassAuth}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Regenerate Auth Token
            </button>
          </div>
          
          {loadingDiag ? (
            <p className="text-gray-500">Loading diagnostic data...</p>
          ) : diagnostic ? (
            <div className="p-4 bg-gray-100 rounded text-xs overflow-auto">
              <pre>{JSON.stringify(diagnostic, null, 2)}</pre>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
} 