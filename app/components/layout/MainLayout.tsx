import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

type MainLayoutProps = {
  children: ReactNode;
  userRole?: string;
  userName?: string;
  userEmail?: string;
};

export default function MainLayout({
  children,
  userRole = "admin",
  userName = "Admin User",
  userEmail = "admin@ims.edu",
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userRole={userRole} userName={userName} userEmail={userEmail} />

      <div className="lg:pl-64">
        <Header userName={userName} />

        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
