"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HomeIcon,
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// Sidebar items - all visible during development
const sidebarItems = [
  { title: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { title: "Faculty", href: "/faculty", icon: UsersIcon },
  { title: "Students", href: "/students", icon: AcademicCapIcon },
  { title: "Courses", href: "/courses", icon: BookOpenIcon },
  { title: "Departments", href: "/departments", icon: BuildingLibraryIcon },
  { title: "Reports", href: "/reports", icon: ChartBarIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-white lg:flex">
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
          {sidebarItems.map((item) => (
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
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Development Admin</span>
            <span className="text-xs text-gray-500 capitalize">admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
