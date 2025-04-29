"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/app/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  UserIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  CalendarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  UsersIcon,
  KeyIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

// Helper function to format dates
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

interface FacultyAchievement {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface Publication {
  id: number;
  title: string;
  journal: string;
  year: number;
  url?: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>("basic");
  const router = useRouter();

  // Mock profile data
  const mockProfile = {
    id: "faculty123",
    username: "johndoe",
    email: "john.doe@example.edu",
    name: "Dr. John Doe",
    role: "faculty",
    department: "CSE",
    departmentName: "Computer Science and Engineering",
    designation: "Associate Professor",
    employeeId: "EMP001",
    qualification: "Ph.D. in Computer Science",
    experience: 8,
    joinDate: "2016-06-15",
    lastLogin: new Date().toISOString(),
    profileImage: "",
    achievements: [
      {
        id: 1,
        title: "Best Teacher Award",
        description:
          "Awarded for excellence in teaching and mentoring students",
        date: "2022-05-15",
      },
      {
        id: 2,
        title: "Research Excellence",
        description: "Recognized for outstanding research contributions in AI",
        date: "2021-11-10",
      },
    ],
    publications: [
      {
        id: 1,
        title: "Machine Learning Approaches for Educational Data Mining",
        journal: "International Journal of Educational Technology",
        year: 2022,
        url: "https://example.com/publication1",
      },
      {
        id: 2,
        title: "A Survey of Deep Learning Techniques in Higher Education",
        journal: "Journal of Educational Data Science",
        year: 2021,
        url: "https://example.com/publication2",
      },
    ],
    researchProjects: 3,
    professionalMemberships: 2,
  };

  const profile = mockProfile;

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="animate-pulse space-y-6 p-6">
          <div className="h-8 w-1/4 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-100 rounded-lg shadow"></div>
            <div className="h-64 md:col-span-2 bg-gray-100 rounded-lg shadow"></div>
          </div>
        </div>
      </MainLayout>
    );
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
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl mb-4">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
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
              <p className="text-sm text-gray-500 mb-1 capitalize">
                {profile?.role}
              </p>
              {profile?.designation && (
                <p className="text-sm text-indigo-600 font-medium">
                  {profile.designation}
                </p>
              )}
              <div className="w-full border-t border-gray-200 pt-4 mt-4">
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
            <CardContent>
              <Tabs
                value={currentTab}
                onValueChange={setCurrentTab}
                className="space-y-4"
              >
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  {(profile?.role === "faculty" || profile?.role === "hod") && (
                    <TabsTrigger value="academic">Academic Info</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="basic">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Username / ID</p>
                        <p className="font-medium">
                          {profile?.username || profile?.id}
                        </p>
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
                          {profile?.departmentName ||
                            profile?.department ||
                            "Not assigned"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <AcademicCapIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="font-medium capitalize">
                          {profile?.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Joined On</p>
                        <p className="font-medium">
                          {profile?.joinDate
                            ? formatDate(new Date(profile.joinDate))
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
                            ? formatDate(new Date(profile.lastLogin))
                            : "First login"}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {(profile?.role === "faculty" || profile?.role === "hod") && (
                  <TabsContent value="academic">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile?.designation && (
                        <div className="flex items-start gap-3">
                          <BriefcaseIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Designation</p>
                            <p className="font-medium">{profile.designation}</p>
                          </div>
                        </div>
                      )}

                      {profile?.qualification && (
                        <div className="flex items-start gap-3">
                          <AcademicCapIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Highest Qualification
                            </p>
                            <p className="font-medium">
                              {profile.qualification}
                            </p>
                          </div>
                        </div>
                      )}

                      {profile?.experience !== undefined && (
                        <div className="flex items-start gap-3">
                          <BriefcaseIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Teaching Experience
                            </p>
                            <p className="font-medium">
                              {profile.experience} years
                            </p>
                          </div>
                        </div>
                      )}

                      {profile?.publications &&
                        profile.publications.length > 0 && (
                          <div className="flex items-start gap-3">
                            <DocumentTextIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">
                                Publications
                              </p>
                              <p className="font-medium">
                                {profile.publications.length}
                              </p>
                            </div>
                          </div>
                        )}

                      {profile?.researchProjects !== undefined && (
                        <div className="flex items-start gap-3">
                          <DocumentTextIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Research Projects
                            </p>
                            <p className="font-medium">
                              {profile.researchProjects}
                            </p>
                          </div>
                        </div>
                      )}

                      {profile?.professionalMemberships !== undefined && (
                        <div className="flex items-start gap-3">
                          <UsersIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Professional Memberships
                            </p>
                            <p className="font-medium">
                              {profile.professionalMemberships}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}
              </Tabs>

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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          {profile?.achievements && profile.achievements.length > 0 && (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrophyIcon className="h-5 w-5 mr-2 text-yellow-500" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{achievement.title}</h3>
                        <span className="text-sm text-gray-500">
                          {achievement.date}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {achievement.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Publications for faculty */}
          {profile?.publications && profile.publications.length > 0 && (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Publications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.publications.map((pub) => (
                    <div
                      key={pub.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{pub.title}</h3>
                        <span className="text-sm text-gray-500">
                          {pub.year}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {pub.journal}
                      </p>
                      {pub.url && (
                        <a
                          href={pub.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                        >
                          View Publication
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
