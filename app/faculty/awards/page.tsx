"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Award } from "lucide-react";

interface FacultyAward {
  id: number;
  title: string;
  organization: string;
  description: string;
  date: string;
  category?: string;
}

export default function FacultyAwardsPage() {
  const [awards, setAwards] = useState<FacultyAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/faculty/awards");

        if (!response.ok) {
          throw new Error("Failed to fetch awards");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch awards");
        }

        setAwards(data.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching awards:", err);
        setError(err instanceof Error ? err.message : "Failed to load awards");
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Awards & Recognitions
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your academic and professional awards and honors
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Award
          </Button>
        </div>

        {/* Main content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-sky-600" />
              Your Awards
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading awards...</p>
            ) : error ? (
              <div className="bg-red-50 text-red-500 p-4 rounded">
                <p>{error}</p>
              </div>
            ) : awards.length === 0 ? (
              <p className="text-gray-500">
                No awards found. Use the "Add Award" button to create one.
              </p>
            ) : (
              <div className="space-y-4">
                {awards.map((award) => (
                  <div
                    key={award.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{award.title}</h3>
                      {award.category && (
                        <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {award.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-600 mt-1">
                      {award.organization}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {award.description}
                    </p>
                    <div className="flex justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {new Date(award.date).toLocaleDateString()}
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
