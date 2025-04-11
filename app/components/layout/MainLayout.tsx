import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout({ children }: { children: ReactNode }) {
  // Mock user data for development
  const mockUser = {
    name: "Development Admin",
    role: "admin",
    email: "admin@ims.edu",
    departmentName: "Computer Science", // Added for department-specific views
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden lg:pl-64">
        <Header {...mockUser} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
