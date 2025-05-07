"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Target } from "lucide-react";

interface ResearchProject {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  status: "ongoing" | "completed" | "planned";
  funding_agency?: string;
  funding_amount?: number;
}

export default function FacultyResearchProjectsPage() {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/faculty/research-projects");

        if (!response.ok) {
          throw new Error("Failed to fetch research projects");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch research projects");
        }

        setProjects(data.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching research projects:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load research projects"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Research Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your ongoing and completed research projects
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </div>

        {/* Main content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Your Research Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading projects...</p>
            ) : error ? (
              <div className="bg-red-50 text-red-500 p-4 rounded">
                <p>{error}</p>
              </div>
            ) : projects.length === 0 ? (
              <p className="text-gray-500">
                No research projects found. Use the "Add Project" button to
                create one.
              </p>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{project.title}</h3>
                      <div
                        className={`px-2 py-1 text-xs rounded-full ${
                          project.status === "ongoing"
                            ? "bg-blue-100 text-blue-800"
                            : project.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {project.status.charAt(0).toUpperCase() +
                          project.status.slice(1)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.description}
                    </p>
                    <div className="flex justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {new Date(project.start_date).toLocaleDateString()} -
                        {project.end_date
                          ? new Date(project.end_date).toLocaleDateString()
                          : "Present"}
                      </span>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
