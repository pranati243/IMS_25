// app/unauthorized/page.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="text-center">
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-red-600">
          Access Denied
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          You don't have permission to access this page.
        </p>
        <div className="mt-10">
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
