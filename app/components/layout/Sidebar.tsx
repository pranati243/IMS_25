"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/app/lib/utils";
import { ComponentType } from "react";

type NavItem = {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles: string[];
};

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    roles: ["admin", "faculty", "hod", "student"],
  },
  {
    name: "Faculty",
    href: "/faculty",
    icon: UserGroupIcon,
    roles: ["admin", "hod"],
  },
  {
    name: "Students",
    href: "/students",
    icon: AcademicCapIcon,
    roles: ["admin", "faculty", "hod"],
  },
  {
    name: "Departments",
    href: "/departments",
    icon: BuildingLibraryIcon,
    roles: ["admin", "hod"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: ChartBarIcon,
    roles: ["admin", "hod"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Cog6ToothIcon,
    roles: ["admin", "hod"],
  },
];

export default function Sidebar({
  userRole = "admin",
  userName = "Admin User",
  userEmail = "admin@ims.edu",
}: {
  userRole?: string;
  userName?: string;
  userEmail?: string;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 z-40 w-full bg-indigo-600 p-2">
        <button
          type="button"
          className="text-white p-2 rounded-md focus:outline-none"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          )}
          <span className="sr-only">Open sidebar</span>
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar for mobile and desktop */}
      <div
        className={classNames(
          "fixed top-0 left-0 z-40 h-full w-64 transform transition-transform duration-300 ease-in-out bg-gradient-to-b from-indigo-700 to-purple-800 shadow-lg",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-indigo-800">
            <h1 className="text-xl font-bold text-white">IMS Portal</h1>
          </div>

          {/* User profile */}
          <div className="px-4 py-6 border-b border-indigo-500/30">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                  {userName.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-white">{userName}</p>
                <p className="text-sm font-medium text-indigo-200">
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </p>
                <p className="text-xs text-indigo-300">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  pathname === item.href
                    ? "bg-indigo-800 text-white"
                    : "text-indigo-100 hover:bg-indigo-600",
                  "group flex items-center px-2 py-2 text-base font-medium rounded-md transition-all duration-200"
                )}
              >
                <item.icon
                  className={classNames(
                    pathname === item.href
                      ? "text-indigo-200"
                      : "text-indigo-300 group-hover:text-indigo-200",
                    "mr-3 flex-shrink-0 h-6 w-6"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-indigo-500/30">
            <button
              className="w-full flex items-center px-2 py-2 text-base font-medium rounded-md text-indigo-100 hover:bg-indigo-600 transition-all duration-200"
              onClick={() => console.log("Logout clicked")}
            >
              <ArrowLeftOnRectangleIcon
                className="mr-3 flex-shrink-0 h-6 w-6 text-indigo-300"
                aria-hidden="true"
              />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
