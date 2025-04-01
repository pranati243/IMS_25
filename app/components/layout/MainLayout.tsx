// app/components/layout/MainLayout.tsx
import { ReactNode } from "react";
import { checkAuth } from "@/app/lib/auth/server";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Check if user is authenticated
  const session = await checkAuth({ required: true });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header user={session?.user} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
