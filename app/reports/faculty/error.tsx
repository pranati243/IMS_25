"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCcw } from "lucide-react";

export default function FacultyReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Faculty Report</h1>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border border-red-100">
          <h2 className="text-lg font-semibold text-red-600 mb-4">
            Error Loading Report
          </h2>

          <p className="text-gray-700 mb-4">
            There was a problem loading the faculty report. This could be due
            to:
          </p>

          <ul className="list-disc pl-5 mb-6 space-y-1 text-gray-600">
            <li>Connection issues with the database</li>
            <li>Missing or invalid data for the selected faculty</li>
            <li>Session timeout or authentication issues</li>
          </ul>

          <div className="bg-gray-50 p-3 rounded mb-6 overflow-auto max-h-32">
            <code className="text-sm text-red-600">{error.message}</code>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button onClick={() => reset()} className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
