"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  UserCircle,
  LogIn,
  UserPlus,
  Shield,
} from "lucide-react";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Generate avatar initials from user name
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Render role badge
  const getRoleBadge = () => {
    const roleColors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      hod: "bg-purple-100 text-purple-800",
      faculty: "bg-blue-100 text-blue-800",
      staff: "bg-green-100 text-green-800",
      student: "bg-amber-100 text-amber-800",
    };
    
    const color = roleColors[user?.role || ""] || "bg-gray-100 text-gray-800";
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${color}`}>
        {user?.role?.toUpperCase()}
      </span>
    );
  };

  // If not authenticated, show login button
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/login" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/register" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Register</span>
          </Link>
        </Button>
      </div>
    );
  }

  // If authenticated, show user menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>My Account</span>
          {getRoleBadge()}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex cursor-pointer items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          
          {user.role === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex cursor-pointer items-center">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}
          
          {(user.role === "admin" || user.role === "hod") && (
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex cursor-pointer items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-600 cursor-pointer focus:text-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 