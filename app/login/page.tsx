"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/providers/auth-provider";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, LogIn, Eye, EyeOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginDebug, setLoginDebug] = useState<string | null>(null);
  const { login, error, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const message = searchParams.get("message");

  // Function to check auth status cookie
  const checkAuthStatusCookie = () => {
    const cookies = document.cookie.split(';');
    return cookies.some(cookie => cookie.trim().startsWith('auth_status='));
  };

  // Check if user is already logged in
  useEffect(() => {
    const redirectToDashboard = () => {
      // Get the current server URL from the window location
      const currentUrl = new URL(window.location.href);
      const serverPort = currentUrl.port || "3000";
      const serverHost = currentUrl.hostname;
      const protocol = currentUrl.protocol;
      const baseUrl = `${protocol}//${serverHost}:${serverPort}`;
      const targetUrl = baseUrl + (redirect || "/dashboard");
      
      console.log("Redirecting to dashboard:", targetUrl);
      window.location.replace(targetUrl);
    };
    
    if (user) {
      console.log("User found in context, redirecting to dashboard");
      redirectToDashboard();
      return;
    }
    
    // If we have the auth_status cookie but no user yet, try to fetch user info
    if (!user && checkAuthStatusCookie()) {
      console.log("Auth status cookie found, attempting to verify session");
      
      // Try to get user info
      fetch("/api/auth/me", {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json().then(data => {
            console.log("Session verified successfully:", data.user?.email);
            redirectToDashboard();
          });
        } else {
          console.warn("Session verification failed with status:", response.status);
          // Clear invalid auth_status cookie
          document.cookie = "auth_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
      })
      .catch(err => {
        console.error("Error verifying session:", err);
      });
    }
  }, [user, redirect]);

  // Set success message from URL if available
  useEffect(() => {
    if (message) {
      setSuccessMessage(message);
    }
  }, [message]);
  
  // Manual API check for debugging
  const debugLoginApi = async () => {
    try {
      setLoginDebug("Testing API connectivity...");
      const response = await fetch("/api/debug/auth", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        setLoginDebug(`API returned non-JSON response: ${textResponse.substring(0, 100)}...`);
        return;
      }
      
      const data = await response.json();
      setLoginDebug(`Debug API connection OK\nTimestamp: ${data.timestamp}\nDb Connected: ${data.env.dbConnected}\nNode Env: ${data.env.nodeEnv}`);
    } catch (err) {
      setLoginDebug(`API test error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Debug cookie functionality
  const debugCookies = async () => {
    try {
      setLoginDebug("Testing cookie functionality...");
      const response = await fetch("/api/debug/cookies", {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        setLoginDebug(`API returned non-JSON response: ${textResponse.substring(0, 100)}...`);
        return;
      }
      
      const data = await response.json();
      
      // Check if cookies were set
      const cookies = document.cookie.split(';');
      const testCookie = cookies.some(cookie => cookie.trim().startsWith('test_cookie='));
      const authStatus = cookies.some(cookie => cookie.trim().startsWith('auth_status='));
      
      setLoginDebug(`Cookie Test Results:
Server cookies: ${data.cookies.map((c: { name: string }) => c.name).join(', ')}
Browser cookies: ${cookies.map(c => c.trim().split('=')[0]).join(', ')}
Test cookie set: ${testCookie ? 'Yes' : 'No'}
Auth status cookie: ${authStatus ? 'Yes' : 'No'}
Session token: ${data.sessionToken}
Timestamp: ${data.timestamp}
      `);
      
      if (testCookie && authStatus) {
        setSuccessMessage("Cookie test successful. Cookies are working properly!");
      } else {
        setSuccessMessage(null);
        setLoginDebug(prevDebug => `${prevDebug}\n\nCookie test failed. Some cookies are not being set correctly.`);
      }
    } catch (err) {
      setLoginDebug(`Cookie test error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Function to run complete diagnostic
  const runDiagnostic = async () => {
    try {
      setLoginDebug("Running full diagnostic test...");
      
      // Current browser information
      const currentUrl = new URL(window.location.href);
      const browserInfo = {
        url: window.location.href,
        host: currentUrl.host,
        hostname: currentUrl.hostname,
        port: currentUrl.port,
        protocol: currentUrl.protocol,
        cookies: document.cookie
      };
      
      // Test direct API access 
      setLoginDebug(prev => `${prev}\n\nTesting API access...`);
      
      const diagnosticResponse = await fetch("/api/debug/diagnostic", {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      let diagnosticData;
      let diagnosticText = '';
      
      if (diagnosticResponse.ok) {
        diagnosticData = await diagnosticResponse.json();
        diagnosticText = JSON.stringify(diagnosticData.diagnostics, null, 2);
      } else {
        diagnosticText = `Error: ${diagnosticResponse.status} ${diagnosticResponse.statusText}`;
      }
      
      // Test a direct login attempt with test credentials
      setLoginDebug(prev => `${prev}\n\nTesting login flow directly...`);
      
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: "hindavi815@gmail.com", 
          password: "password123", 
          rememberMe: true 
        })
      });
      
      let loginData;
      let loginText = '';
      
      if (loginResponse.ok) {
        loginData = await loginResponse.json();
        loginText = `Success: ${loginData.success}, User role: ${loginData.user?.role || 'N/A'}`;
        
        // Check cookies after login
        const cookiesAfterLogin = document.cookie.split(';').map(c => c.trim());
        loginText += `\nCookies after login: ${cookiesAfterLogin.join(', ')}`;
        
        // Test session verification
        const meResponse = await fetch("/api/auth/me", {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (meResponse.ok) {
          const meData = await meResponse.json();
          loginText += `\nSession verification: Success (${meData.user?.email || 'unknown'})`;
        } else {
          loginText += `\nSession verification failed: ${meResponse.status}`;
        }
      } else {
        try {
          loginData = await loginResponse.json();
          loginText = `Failed: ${loginData.message || 'Unknown error'}`;
        } catch (e) {
          loginText = `Error: ${loginResponse.status} ${loginResponse.statusText}`;
        }
      }
      
      // Compile all diagnostic information
      setLoginDebug(`
DIAGNOSTIC REPORT
================

BROWSER INFORMATION:
${JSON.stringify(browserInfo, null, 2)}

API DIAGNOSTIC TEST:
${diagnosticText}

LOGIN TEST:
${loginText}

RECOMMENDATIONS:
${generateRecommendations(diagnosticData, loginResponse.ok)}
      `);
      
    } catch (err) {
      setLoginDebug(`Diagnostic test error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  // Function to fix database issues
  const fixDatabase = async () => {
    try {
      setLoginDebug("Fixing database issues...");
      
      const response = await fetch("/api/debug/fix-database", {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLoginDebug(`Database fixes applied:
- User fixes: ${data.results.userFixes}
- Session fixes: ${data.results.sessionFixes}
- Permission fixes: ${data.results.permissionFixes}
${data.results.errors.length > 0 ? `\nErrors:\n${data.results.errors.join('\n')}` : ''}

Try logging in with the following credentials:
Email: hindavi815@gmail.com
Password: password123
        `);
        
        // Pre-fill the form with test credentials
        setUsername("hindavi815@gmail.com");
        setPassword("password123");
        setSuccessMessage("Database fixed successfully. Test credentials have been filled in.");
      } else {
        setLoginDebug(`Database fix failed: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setLoginDebug(`Database fix error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Function for direct login
  const directLogin = async () => {
    try {
      setLoginDebug("Attempting direct login...");
      setIsSubmitting(true);
      
      // Use test email
      const testEmail = username || "hindavi815@gmail.com";
      
      const response = await fetch("/api/debug/direct-login", {
        method: "POST",
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: testEmail,
          bypass: "debug-mode-bypass"
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setLoginDebug(`Direct login successful for: ${data.user.email} (${data.user.role})`);
        setSuccessMessage("Direct login successful. Redirecting to dashboard...");
        
        // Redirect to dashboard
        setTimeout(() => {
          const currentUrl = new URL(window.location.href);
          const port = currentUrl.port || "3000";
          const protocol = currentUrl.protocol;
          const host = currentUrl.hostname;
          
          window.location.replace(`${protocol}//${host}:${port}/dashboard`);
        }, 1000);
      } else {
        setLoginDebug(`Direct login failed: ${response.status} ${response.statusText}`);
        try {
          const errorData = await response.json();
          setLoginDebug(prev => `${prev}\nError: ${errorData.message || 'Unknown error'}`);
        } catch (e) {
          // Response might not be JSON
        }
      }
    } catch (err) {
      setLoginDebug(`Direct login error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to generate recommendations based on diagnostic data
  const generateRecommendations = (diagnosticData: any, loginSuccess: boolean) => {
    const recommendations = [];
    
    // Check for common issues
    if (!diagnosticData) {
      recommendations.push("- API server may not be running or accessible");
    } else {
      // Check database connection
      if (!diagnosticData.diagnostics.database.connected) {
        recommendations.push("- Database connection failed: " + diagnosticData.diagnostics.database.error);
      }
      
      // Check authentication setup
      if (!diagnosticData.diagnostics.authentication.cookies.present) {
        recommendations.push("- Session cookie is not being set properly");
      } else if (!diagnosticData.diagnostics.authentication.token.valid) {
        recommendations.push("- Session token is invalid: " + diagnosticData.diagnostics.authentication.token.error);
      }
      
      // Check port configuration
      const port = diagnosticData.diagnostics.nextjs.port;
      if (port !== window.location.port) {
        recommendations.push(`- Port mismatch: API server is on port ${port} but browser is on port ${window.location.port}`);
      }
    }
    
    // Login specific issues
    if (!loginSuccess) {
      recommendations.push("- Login API call failed - check credentials or API connectivity");
    }
    
    // If no specific issues found
    if (recommendations.length === 0) {
      // If login succeeded but we're still having issues
      if (loginSuccess) {
        recommendations.push("- Login API works but redirection may be failing");
        recommendations.push("- Try clicking 'Force Dashboard' to test direct navigation");
        recommendations.push("- Check for any JavaScript errors in browser console");
      } else {
        recommendations.push("- No specific issues identified, try checking browser console for errors");
      }
    }
    
    return recommendations.join("\n");
  };

  // Function to directly go to dashboard
  const forceDashboard = () => {
    const currentUrl = new URL(window.location.href);
    const serverPort = currentUrl.port || "3000";
    const serverHost = currentUrl.hostname;
    const protocol = currentUrl.protocol;
    const baseUrl = `${protocol}//${serverHost}:${serverPort}`;
    
    window.location.href = `${baseUrl}/dashboard`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    
    try {
      const success = await login(username, password, rememberMe);
      if (success) {
        console.log("Login successful, redirecting to:", redirect);
        router.push(redirect);
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1"></div>
        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your IMS account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 text-sm rounded-md border border-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {loginDebug && (
            <div className="p-3 bg-gray-50 text-gray-700 text-xs rounded-md border border-gray-200 font-mono whitespace-pre-wrap">
              {loginDebug}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Enter your Faculty ID or Roll Number"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11"
              />
              <p className="text-xs text-gray-500">
                For faculty/admin: Enter your Faculty ID<br />
                For students: Enter your Roll Number
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rememberMe" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(checked === true)} 
              />
              <label
                htmlFor="rememberMe"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 transition-colors"
              disabled={isSubmitting || !username || !password}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign in
                </span>
              )}
            </Button>
            
            <div className="text-center">
              <button 
                type="button" 
                onClick={debugLoginApi}
                className="text-xs text-gray-500 hover:text-gray-700 mr-2"
              >
                Debug API
              </button>
              <button 
                type="button" 
                onClick={debugCookies}
                className="text-xs text-gray-500 hover:text-gray-700 mr-2"
              >
                Test Cookies
              </button>
              <button 
                type="button" 
                onClick={runDiagnostic}
                className="text-xs text-gray-500 hover:text-gray-700 mr-2"
              >
                Full Diagnostic
              </button>
              <button 
                type="button" 
                onClick={fixDatabase}
                className="text-xs text-gray-500 hover:text-gray-700 mr-2"
              >
                Fix Database
              </button>
              <button 
                type="button" 
                onClick={directLogin}
                className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded mr-2"
              >
                Direct Login
              </button>
              <button 
                type="button" 
                onClick={forceDashboard}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Force Dashboard
              </button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8">
          <Separator className="my-2" />
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Create an account
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
