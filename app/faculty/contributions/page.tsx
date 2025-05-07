"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/app/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface Contribution {
  Contribution_ID: number;
  F_ID: number;
  Contribution_Type: string;
  Description: string;
  Contribution_Date: string;
}

export default function FacultyContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/faculty/contributions");

        if (!response.ok) {
          throw new Error("Failed to fetch contributions");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch contributions");
        }

        setContributions(data.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching contributions:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load contributions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Faculty Contributions
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your academic and professional contributions
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Contribution
          </Button>
        </div>

        {/* Main content */}
        <Card>
          <CardHeader>
            <CardTitle>Your Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading contributions...</p>
            ) : error ? (
              <div className="bg-red-50 text-red-500 p-4 rounded">
                <p>{error}</p>
              </div>
            ) : contributions.length === 0 ? (
              <p className="text-gray-500">
                No contributions found. Use the "Add Contribution" button to
                create one.
              </p>
            ) : (
              <div className="space-y-4">
                {contributions.map((contribution) => (
                  <div
                    key={contribution.Contribution_ID}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-medium">
                      {contribution.Contribution_Type}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {contribution.Description}
                    </p>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(
                          contribution.Contribution_Date
                        ).toLocaleDateString()}
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
