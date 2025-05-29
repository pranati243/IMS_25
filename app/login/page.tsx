import { Suspense } from "react";
import LoginForm from "./login-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-[480px]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-10">
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight">
          Institutional Management System
        </h2>
      </div>
      <div className="rounded-lg border p-8 shadow-sm">
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-4 w-3/4 mb-8" />
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-5 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
