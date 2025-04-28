"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  CalendarIcon,
  KeyIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import MainLayout from "@/app/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/app/lib/utils";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  departmentId: string;
  departmentName: string;
  joinDate: string;
  lastLogin: string;
  profileImage?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/login?redirect=/profile");
      return;
    }

    // If still loading session, wait
    if (status === "loading") {
      return;
    }

    async function fetchUserProfile() {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          if (response.status === 401) {
            // Redirect to login if unauthorized
            router.push("/login?redirect=/profile");
            return;
          }
          throw new Error("Failed to fetch profile data");
        }

        const data = await response.json();
        setProfile(data.user);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Could not load profile information");
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [router, status]);

  // Loading state while session is being fetched
  if (status === "loading" || loading) {
    return (
      <MainLayout>
        <div className="animate-pulse space-y-6 p-6">
          <div className="h-8 w-1/4 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-100 rounded-lg shadow"></div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => router.push("/login")}>
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // No profile data but authenticated
  if (!profile && status === "authenticated") {
    // Use session data as a fallback
    const sessionProfile = {
      id: session?.user?.id || "",
      username: session?.user?.name || "",
      email: session?.user?.email || "",
      name: session?.user?.name || "",
      role: session?.user?.role || "user",
      departmentId: session?.user?.departmentId || "",
      departmentName: session?.user?.departmentName || "Not assigned",
      joinDate: "",
      lastLogin: "",
    };

    setProfile(sessionProfile as UserProfile);
    return null; // Will re-render with profile set
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-0">
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl mb-4">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile?.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>
                    {profile?.name?.charAt(0) ||
                      profile?.username?.charAt(0) ||
                      "U"}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-1">
                {profile?.name || profile?.username}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {profile?.role
                  ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
                  : "User"}
              </p>
              <div className="w-full border-t border-gray-200 pt-4 mt-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push("/profile/edit")}
                >
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Details */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>User Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <UserIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Username / ID</p>
                    <p className="font-medium">{profile?.username}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">
                      {profile?.departmentName || "Not assigned"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AcademicCapIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">{profile?.role}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Joined On</p>
                    <p className="font-medium">
                      {profile?.joinDate
                        ? formatDate(profile.joinDate)
                        : "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ClockIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="font-medium">
                      {profile?.lastLogin
                        ? formatDate(profile.lastLogin)
                        : "First login"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <Button
                    onClick={() => router.push("/profile/change-password")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <KeyIcon className="h-4 w-4" />
                    Change Password
                  </Button>

                  <Button
                    onClick={() => router.push("/logout")}
                    variant="destructive"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
