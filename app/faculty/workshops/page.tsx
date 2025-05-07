"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";

interface Workshop {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  venue: string;
  type: "workshop" | "conference" | "seminar";
  role: "attendee" | "presenter" | "organizer";
}

export default function FacultyWorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/faculty/workshops");

        if (!response.ok) {
          throw new Error("Failed to fetch workshops and conferences");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to fetch workshops and conferences"
          );
        }

        setWorkshops(data.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching workshops:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load workshops"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Workshops & Conferences
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage workshops, conferences, and seminars attended or organized
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Event
          </Button>
        </div>

        {/* Main content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              Your Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading events...</p>
            ) : error ? (
              <div className="bg-red-50 text-red-500 p-4 rounded">
                <p>{error}</p>
              </div>
            ) : workshops.length === 0 ? (
              <p className="text-gray-500">
                No workshops or conferences found. Use the "Add Event" button to
                create one.
              </p>
            ) : (
              <div className="space-y-4">
                {workshops.map((workshop) => (
                  <div
                    key={workshop.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{workshop.title}</h3>
                      <div
                        className={`px-2 py-1 text-xs rounded-full ${
                          workshop.type === "workshop"
                            ? "bg-purple-100 text-purple-800"
                            : workshop.type === "conference"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-teal-100 text-teal-800"
                        }`}
                      >
                        {workshop.type.charAt(0).toUpperCase() +
                          workshop.type.slice(1)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {workshop.description}
                    </p>
                    <div className="flex justify-between items-center mt-3">
                      <div>
                        <span className="text-xs text-gray-500 block">
                          {workshop.venue}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(workshop.start_date).toLocaleDateString()}
                          {workshop.end_date &&
                            ` - ${new Date(
                              workshop.end_date
                            ).toLocaleDateString()}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            workshop.role === "presenter"
                              ? "bg-amber-100 text-amber-800"
                              : workshop.role === "organizer"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {workshop.role}
                        </span>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
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
