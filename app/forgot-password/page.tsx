"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { AlertCircle, CheckCircle2, ArrowLeft, Send, RefreshCw } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);
  const [countDown, setCountDown] = useState(0);
  const router = useRouter();

  // Handle countdown for resend cooldown
  const startCountdown = () => {
    const cooldownPeriod = 60; // 60 seconds cooldown
    setCountDown(cooldownPeriod);
    setLastRequestTime(Date.now());
    
    const interval = setInterval(() => {
      setCountDown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      setStatus("idle");
      setMessage("");

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
        throw new Error(data?.message || "Failed to send reset email");
      }

      setStatus("success");
      setMessage(
        "Password reset link has been sent to your email address. Please check your inbox and spam folders."
      );
      startCountdown();
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

  const handleResend = async () => {
    if (!email || countDown > 0) return;

    try {
      setIsResending(true);
      setMessage("");

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        throw new Error("Server returned an invalid response. Please try again later.");
      }

      if (!response.ok) {
        throw new Error(data?.message || "Failed to resend reset email");
      }

      setMessage(
        "Another password reset link has been sent to your email address. Please check your inbox and spam folders."
      );
      startCountdown();
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-1"></div>
        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 p-2 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-medium text-lg mb-2">Check Your Email</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                
                <div className="space-y-3 w-full">
                  <Button
                    onClick={handleResend}
                    disabled={countDown > 0 || isResending}
                    variant="outline"
                    className="w-full"
                  >
                    {isResending ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resending...
                      </span>
                    ) : countDown > 0 ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Resend Email ({countDown}s)
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Resend Email
                      </span>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    Return to Login
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === "error" && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="your.email@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 transition-colors"
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Reset Link
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