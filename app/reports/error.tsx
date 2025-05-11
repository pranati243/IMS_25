"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AlertCircle, ArrowLeft, RefreshCcw } from "lucide-react";

export default function ReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Reports page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full border border-red-100">
        <div className="flex items-center justify-center h-16 w-16 bg-red-50 rounded-full mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>

        <h2 className="text-xl font-semibold text-center mb-3">
          Something went wrong
        </h2>

        <p className="text-gray-600 mb-6 text-center">
          There was an error loading the reports. This might be due to a
          temporary issue or missing data.
        </p>

        <div className="text-sm mb-6 p-3 bg-red-50 rounded border border-red-200 text-red-700 overflow-auto">
          <p className="font-medium">Error message:</p>
          <p className="font-mono">{error.message || "Unknown error"}</p>
        </div>

        <div className="flex flex-col space-y-2">
          <Button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
