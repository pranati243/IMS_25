"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HomeIcon,
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  FolderIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { useAuth, UserRole } from "@/app/providers/auth-provider";

// Define sidebar items with required roles
const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    roles: ["admin", "hod", "faculty", "staff", "student"],
  },
  {
    title: "Faculty",
    href: "/faculty",
    icon: UsersIcon,
    roles: ["admin", "hod", "faculty", "staff", "student"],
  },
  {
    title: "Students",
    href: "/students",
    icon: AcademicCapIcon,
    roles: ["admin", "hod", "faculty", "staff"],
  },
  {
    title: "Courses",
    href: "/courses",
    icon: BookOpenIcon,
    roles: ["admin", "hod", "faculty", "staff", "student"],
  },
  {
    title: "Departments",
    href: "/departments",
    icon: BuildingLibraryIcon,
    roles: ["admin", "hod"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: ChartBarIcon,
    roles: ["admin", "hod"],
  },
  {
    title: "Resources",
    href: "/resources",
    icon: FolderIcon,
    roles: ["admin", "hod", "faculty", "staff", "student"],
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: CalendarIcon,
    roles: ["admin", "hod", "faculty", "staff", "student"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Cog6ToothIcon,
    roles: ["admin", "hod"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Filter sidebar items based on user role
  const filteredItems = sidebarItems.filter(
    (item) => user && item.roles.includes(user.role as UserRole)
  );

  return (
    <div className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-white lg:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <span>IMS Portal</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 overflow-auto py-2">
        <nav className="flex flex-col gap-1 px-2">
          {filteredItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "flex h-10 w-full items-center justify-start gap-2 rounded-md px-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100",
                pathname.startsWith(item.href) &&
                  "bg-gray-100 font-semibold text-gray-900"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            </Button>
          ))}
        </nav>
      </ScrollArea>
      {user && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
              {user.name ? user.name.charAt(0) : user.username.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {user.name || user.username}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
