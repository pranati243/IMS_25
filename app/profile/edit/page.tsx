"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Save } from "lucide-react";
import { AlertCircle } from "lucide-react";

// Fallback departments
const DEFAULT_DEPARTMENTS = [
  { id: 1, name: "Computer Science" },
  { id: 2, name: "Electrical Engineering" },
  { id: 3, name: "Mechanical Engineering" },
  { id: 4, name: "Civil Engineering" },
  { id: 5, name: "Information Technology" },
];

export default function EditProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    facultyId: "",
    studentId: "",
    role: "faculty",
    departmentId: "",
    password: "",
    confirmPassword: "",
  });

  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load profile from cookie-authenticated API
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (res.ok) {
          setFormData((prev) => ({
            ...prev,
            name: data.profile.name,
            email: data.profile.email,
            role: data.profile.role,
            departmentId: data.profile.department?.toString() || "",
            facultyId: data.profile.facultyId || "",
            studentId: data.profile.studentId || "",
          }));
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Server error. Try again later.");
      }
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await fetch("/api/departments");
        const data = await response.json();
        if (data.success) {
          setDepartments(
            data.data.map((dept: any) => ({
              id: dept.Department_ID,
              name: dept.Department_Name,
            }))
          );
        }
      } catch {
        // fallback to default
      }
    }

    fetchDepartments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Update failed");
        return;
      }

      router.push("/profile");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Server error during update");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <Card className="w-full max-w-md overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1" />
        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <CardTitle className="text-3xl font-bold">Edit Profile</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentId">Department</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) =>
                    handleSelectChange("departmentId", value)
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.role === "faculty" && (
              <div className="space-y-2">
                <Label htmlFor="facultyId">Faculty ID</Label>
                <Input
                  id="facultyId"
                  name="facultyId"
                  value={formData.facultyId}
                  onChange={handleChange}
                />
              </div>
            )}

            {formData.role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="studentId">Roll Number</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password (optional)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-white border-opacity-50 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
