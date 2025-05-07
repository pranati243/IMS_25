"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Globe } from "lucide-react";

interface Membership {
  SrNo: number;
  F_ID: number;
  Organization_Name: string;
  Membership_Type: string;
  Membership_ID?: string;
  Start_Date: string;
  End_Date?: string;
}

export default function FacultyMembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/faculty/memberships");

        if (!response.ok) {
          throw new Error("Failed to fetch professional memberships");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to fetch professional memberships"
          );
        }

        setMemberships(data.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching memberships:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load memberships"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Professional Memberships
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your professional organization and society memberships
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Membership
          </Button>
        </div>

        {/* Main content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-red-600" />
              Your Memberships
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading memberships...</p>
            ) : error ? (
              <div className="bg-red-50 text-red-500 p-4 rounded">
                <p>{error}</p>
              </div>
            ) : memberships.length === 0 ? (
              <p className="text-gray-500">
                No professional memberships found. Use the "Add Membership"
                button to create one.
              </p>
            ) : (
              <div className="space-y-4">
                {memberships.map((membership) => (
                  <div
                    key={membership.SrNo}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">
                        {membership.Organization_Name}
                      </h3>
                      <span className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded">
                        {membership.Membership_Type}
                      </span>
                    </div>
                    {membership.Membership_ID && (
                      <p className="text-sm text-gray-600 mt-1">
                        ID: {membership.Membership_ID}
                      </p>
                    )}
                    <div className="flex justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {new Date(membership.Start_Date).toLocaleDateString()} -
                        {membership.End_Date
                          ? new Date(membership.End_Date).toLocaleDateString()
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
