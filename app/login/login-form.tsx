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

export default function LoginForm() {
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
    const cookies = document.cookie.split(";");
    return cookies.some((cookie) => cookie.trim().startsWith("auth_status="));
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
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json().then((data) => {
              console.log("Session verified successfully:", data.user?.email);
              redirectToDashboard();
            });
          } else {
            console.warn(
              "Session verification failed with status:",
              response.status
            );
            // Clear invalid auth_status cookie
            document.cookie =
              "auth_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
        })
        .catch((err) => {
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
      const response = await fetch("/api/auth/bypass-middleware", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      setLoginDebug(JSON.stringify(data, null, 2));
    } catch (error) {
      setLoginDebug(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(username, password, rememberMe);
      // Login handled by the auth provider
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight">
          Institutional Management System
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your username and password to access the system
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* Success Message Alert */}
            {successMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <div>{successMessage}</div>
              </div>
            )}

            {/* Error Message Alert */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={() => setRememberMe(!rememberMe)}
                  />
                  <label
                    htmlFor="remember-me"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                      <span className="ml-2">Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
