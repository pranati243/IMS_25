"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, ArrowLeft, Key, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "validating" | "invalid" | "success" | "error">("validating");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Validate token when component mounts
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStatus("invalid");
        setMessage("Invalid or missing reset token. Please request a new password reset link.");
        return;
      }

      try {
        const response = await fetch(`/api/auth/validate-reset-token?token=${token}`);
        
        // Try to parse the JSON response safely
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("Error parsing JSON response:", parseError);
          throw new Error("Server returned an invalid response. Please try again later.");
        }

        if (!response.ok || !data.success) {
          setStatus("invalid");
          setMessage(data?.message || "Invalid or expired reset token. Please request a new password reset link.");
          return;
        }

        setStatus("idle");
      } catch (err) {
        setStatus("invalid");
        setMessage(
          err instanceof Error
            ? err.message
            : "An error occurred while validating your reset token. Please try again."
        );
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!password || !confirmPassword) return;
    
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("idle");
      setMessage("");

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      // Try to parse the JSON response safely
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        throw new Error("Server returned an invalid response. Please try again later.");
      }

      if (!response.ok) {
        throw new Error(data?.message || "Failed to reset password");
      }

      setStatus("success");
      setMessage("Your password has been reset successfully. You can now log in with your new password.");
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1"></div>
        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Create a new password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "validating" && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                      <div className="h-2 bg-gray-200 rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mt-4">Validating your reset token...</p>
            </div>
          )}

          {status === "invalid" && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 p-2 mb-4 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-medium text-lg mb-2">Invalid Token</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button
                onClick={() => router.push("/forgot-password")}
                className="mt-2 bg-indigo-600 hover:bg-indigo-700"
              >
                Request New Link
              </Button>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-green-100 p-2 mb-4 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-lg mb-2">Password Reset Complete</h3>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button
                onClick={() => router.push("/login")}
                className="mt-2 bg-indigo-600 hover:bg-indigo-700"
              >
                Sign In
              </Button>
            </div>
          )}

          {(status === "idle" || status === "error") && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === "error" && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    disabled={isSubmitting}
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
                <p className="text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 pr-10"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 transition-colors"
                disabled={isSubmitting || !password || !confirmPassword}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Reset Password
                  </span>
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pb-8">
          <Separator className="my-2" />
          <div className="text-center text-sm">
            <Link 
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 