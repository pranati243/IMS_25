import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Building,
  Landmark,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Institute Management System
            </h1>
            <p className="text-xl opacity-90 mb-10">
              A comprehensive platform for managing academic resources, faculty, and student information
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-indigo-700 hover:bg-gray-100">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Users className="h-10 w-10 text-indigo-600" />}
              title="Faculty Management"
              description="Comprehensive tools for managing faculty information, qualifications, and performance."
            />
            <FeatureCard
              icon={<GraduationCap className="h-10 w-10 text-indigo-600" />}
              title="Student Records"
              description="Track student admissions, academic progress, and achievements."
            />
            <FeatureCard
              icon={<Building className="h-10 w-10 text-indigo-600" />}
              title="Department Administration"
              description="Organize departments, allocate resources, and manage academic programs."
            />
            <FeatureCard
              icon={<BookOpen className="h-10 w-10 text-indigo-600" />}
              title="Course Management"
              description="Create, update and manage courses, schedules, and curriculum."
            />
          </div>
        </div>
      </section>

      {/* Role-based Access Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Role-based Access</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <RoleCard
              icon={<ShieldCheck className="h-8 w-8 text-red-500" />}
              title="Administrators"
              description="Complete control over the system with access to all features and data."
              permissions={[
                "Manage users and permissions",
                "Configure system settings",
                "Generate institutional reports",
                "Oversee all departments"
              ]}
            />
            <RoleCard
              icon={<Landmark className="h-8 w-8 text-purple-500" />}
              title="Department Heads"
              description="Department-specific management capabilities."
              permissions={[
                "Manage faculty in their department",
                "Access student records",
                "Create and manage courses",
                "View departmental reports"
              ]}
            />
            <RoleCard
              icon={<UserCheck className="h-8 w-8 text-blue-500" />}
              title="Faculty Members"
              description="Tools for academic management and student engagement."
              permissions={[
                "Update personal information",
                "View assigned courses",
                "Access student information",
                "Record academic contributions"
              ]}
            />
          </div>
        </div>
      </section>

      {/* Analytics & Reporting */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Analytics & Reporting</h2>
              <p className="text-gray-700 mb-6">
                Gain insights into institutional performance with comprehensive analytics and reporting tools.
                Generate reports for NAAC and NBA accreditation requirements.
              </p>
              <ul className="space-y-3">
                {[
                  "Faculty performance metrics",
                  "Student progression tracking",
                  "Department-wise statistics",
                  "Research output analysis",
                  "Custom report generation",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8">
                <Link href="/dashboard">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>View Dashboard</span>
                </Link>
              </Button>
            </div>
            <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-lg">
              <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-gray-400">Dashboard Preview</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Institute Management System</h3>
            <p className="opacity-70 mb-8">
              A comprehensive solution for educational institution management
            </p>
            <div className="flex justify-center gap-6">
              <Link href="/login" className="text-sm hover:underline">Login</Link>
              <Link href="/register" className="text-sm hover:underline">Register</Link>
              <Link href="#" className="text-sm hover:underline">Privacy Policy</Link>
              <Link href="#" className="text-sm hover:underline">Terms of Service</Link>
            </div>
            <p className="mt-8 text-sm opacity-50">
              © {new Date().getFullYear()} Institute Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function RoleCard({ 
  icon, 
  title, 
  description, 
  permissions 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  permissions: string[]
}) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-white p-2 rounded-lg shadow-sm">{icon}</div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="space-y-2">
        {permissions.map((perm, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="min-w-4 h-4 w-4 rounded-full bg-green-100 flex items-center justify-center mt-1">
              <div className="h-2 w-2 rounded-full bg-green-600"></div>
            </div>
            <span className="text-sm">{perm}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
