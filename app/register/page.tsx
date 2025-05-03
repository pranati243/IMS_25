"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, UserPlus, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Default departments
const DEFAULT_DEPARTMENTS = [
  { id: 1, name: "Computer Science" },
  { id: 2, name: "Electrical Engineering" },
  { id: 3, name: "Mechanical Engineering" },
  { id: 4, name: "Civil Engineering" },
  { id: 5, name: "Information Technology" }
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    facultyId: "",
    studentId: "",
    password: "",
    confirmPassword: "",
    role: "faculty",
    departmentId: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{id: number, name: string}[]>(DEFAULT_DEPARTMENTS);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validatingFaculty, setValidatingFaculty] = useState(false);
  const [facultyExists, setFacultyExists] = useState<boolean | null>(null);
  const router = useRouter();

  // Fetch departments when component mounts
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await fetch('/api/departments', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        // Check content type
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Non-JSON response from /api/departments endpoint:", await response.text());
          return;
        }
        
        const data = await response.json();
        if (data.success) {
          setDepartments(data.data.map((dept: any) => ({
            id: dept.Department_ID,
            name: dept.Department_Name
          })));
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
        // Keep using default departments if fetch fails
      }
    }
    
    fetchDepartments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset faculty/student ID when role changes
    if (name === "role") {
      setFormData(prev => ({ 
        ...prev, 
        facultyId: "", 
        studentId: ""
      }));
      setFacultyExists(null);
    }
  };

  // Validate if faculty exists
  const validateFacultyId = async () => {
    if (!formData.facultyId || formData.role !== "faculty") return;
    
    setValidatingFaculty(true);
    setFacultyExists(null);
    setError(null);
    
    try {
      const response = await fetch(`/api/faculty/check-exists?id=${formData.facultyId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.exists) {
        setFacultyExists(true);
      } else {
        setFacultyExists(false);
        setError("Faculty ID not found. Only existing faculty can register.");
      }
    } catch (err) {
      console.error("Error checking faculty:", err);
      setError("Error checking faculty ID. Please try again.");
      setFacultyExists(false);
    } finally {
      setValidatingFaculty(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // For faculty role, validate faculty ID exists
    if (formData.role === "faculty") {
      if (!formData.facultyId) {
        setError("Faculty ID is required");
        return;
      }
      
      // Verify faculty exists
      if (facultyExists !== true) {
        await validateFacultyId();
        if (facultyExists !== true) {
          return; // Stop submission if faculty doesn't exist
        }
      }
    }

    // For student role, check student ID
    if (formData.role === "student" && !formData.studentId) {
      setError("Student Roll Number is required");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Determine username based on role
      const username = formData.role === "faculty" ? formData.facultyId : formData.studentId;
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          username: username,
          password: formData.password,
          role: formData.role,
          departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
          // Include IDs in the appropriate fields for database mapping
          facultyId: formData.role === "faculty" ? formData.facultyId : null,
          studentId: formData.role === "student" ? formData.studentId : null
        })
      });

      // Check for non-JSON response
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Non-JSON response from /api/auth/register endpoint:", await response.text());
        throw new Error("Server error: Invalid response format");
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful, redirect to login with a more reliable method
      window.location.href = '/login?message=Registration successful. Please log in.';
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1"></div>
        <CardHeader className="space-y-2 text-center pb-6 pt-8">
          <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join the Information Management System
          </CardDescription>
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
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="h-11"
              />
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange('role', value)}
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
                <Label htmlFor="departmentId" className="text-sm font-medium">Department</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => handleSelectChange('departmentId', value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs text-gray-500 -mt-2">
              Note: Admin and HOD roles can only be assigned by administrators
            </p>

            {formData.role === "faculty" && (
              <div className="space-y-2">
                <Label htmlFor="facultyId" className="text-sm font-medium">Faculty ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="facultyId"
                    name="facultyId"
                    type="text"
                    required
                    placeholder="Enter your Faculty ID"
                    value={formData.facultyId}
                    onChange={handleChange}
                    className="h-11"
                    onBlur={validateFacultyId}
                  />
                  <Button 
                    type="button" 
                    onClick={validateFacultyId}
                    disabled={validatingFaculty || !formData.facultyId}
                    className="shrink-0"
                  >
                    {validatingFaculty ? "Checking..." : "Verify"}
                  </Button>
                </div>
                {facultyExists === true && (
                  <p className="text-xs text-green-600">✓ Faculty ID verified</p>
                )}
                <p className="text-xs text-gray-500">
                  Only existing faculty members can register. Your Faculty ID must be added by an administrator first.
                </p>
              </div>
            )}

            {formData.role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-sm font-medium">Roll Number</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  type="text"
                  required
                  placeholder="Enter your Roll Number"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
            )}

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
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
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              disabled={isSubmitting || 
                        (formData.role === "faculty" && facultyExists !== true)}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="h-5 w-5 border-2 border-white border-opacity-50 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </div>
              )}
            </Button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-800">
                Sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 