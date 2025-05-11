"use client";

import { useAuth } from "@/app/providers/auth-provider";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import MainLayout from "@/app/components/layout/MainLayout";
import { useEffect, useState } from "react";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // This ensures hydration issues are avoided
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle authentication check after component is mounted
  useEffect(() => {
    if (!loading && !user && isClient) {
      // If not authenticated and not loading, redirect to login
      router.push("/login?returnUrl=/reports/faculty");
    }
  }, [user, loading, router, isClient]);

  if (!isClient || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
        <p>Redirecting to login page...</p>
      </div>
    );
  }

  return <MainLayout>{children}</MainLayout>;
}
