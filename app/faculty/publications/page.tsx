"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/app/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";

interface Publication {
  id: number;
  title_of_the_paper: string;
  name_of_the_conference: string;
  Year_Of_Study: string;
  paper_link: string;
}

export default function FacultyPublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/faculty/publications");

        if (!response.ok) {
          throw new Error("Failed to fetch publications");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch publications");
        }

        setPublications(data.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching publications:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load publications"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Faculty Publications
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your research papers and publications
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Publication
          </Button>
        </div>

        {/* Main content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Your Publications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading publications...</p>
            ) : error ? (
              <div className="bg-red-50 text-red-500 p-4 rounded">
                <p>{error}</p>
              </div>
            ) : publications.length === 0 ? (
              <p className="text-gray-500">
                No publications found. Use the "Add Publication" button to
                create one.
              </p>
            ) : (
              <div className="space-y-4">
                {publications.map((publication) => (
                  <div
                    key={publication.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-medium">
                      {publication.title_of_the_paper}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {publication.name_of_the_conference}
                    </p>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {publication.Year_Of_Study}
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
