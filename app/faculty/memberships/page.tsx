"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DialogForm } from "@/app/components/ui/dialog-form";
import { Plus, Globe, Trash, Pencil } from "lucide-react";
import { toast } from "sonner";

interface Membership {
  SrNo: number;
  F_ID: string;
  Organization_Name: string;
  Membership_Type: string;
  Membership_ID?: string;
  Start_Date: string;
  End_Date?: string;
}

interface MembershipFormData {
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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMembership, setSelectedMembership] =
    useState<Membership | null>(null);
  const [formData, setFormData] = useState<MembershipFormData>({
    Organization_Name: "",
    Membership_Type: "",
    Membership_ID: "",
    Start_Date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchMemberships();
  }, []);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.Organization_Name ||
      !formData.Membership_Type ||
      !formData.Start_Date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/faculty/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add membership");
      }

      toast.success("Membership added successfully");
      setAddDialogOpen(false);
      setFormData({
        Organization_Name: "",
        Membership_Type: "",
        Membership_ID: "",
        Start_Date: new Date().toISOString().split("T")[0],
      });

      // Refresh memberships list
      await fetchMemberships();
    } catch (err) {
      console.error("Error adding membership:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to add membership"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMembership) return;

    if (
      !formData.Organization_Name ||
      !formData.Membership_Type ||
      !formData.Start_Date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/faculty/memberships/${selectedMembership.SrNo}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update membership");
      }

      toast.success("Membership updated successfully");
      setEditDialogOpen(false);
      setSelectedMembership(null);

      // Refresh memberships list
      await fetchMemberships();
    } catch (err) {
      console.error("Error updating membership:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update membership"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMembership) return;

    try {
      const response = await fetch(
        `/api/faculty/memberships/${selectedMembership.SrNo}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete membership");
      }

      toast.success("Membership deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedMembership(null);

      // Refresh memberships list
      await fetchMemberships();
    } catch (err) {
      console.error("Error deleting membership:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete membership"
      );
    }
  };

  const handleViewDetails = (membership: Membership) => {
    setSelectedMembership(membership);
    setFormData({
      Organization_Name: membership.Organization_Name,
      Membership_Type: membership.Membership_Type,
      Membership_ID: membership.Membership_ID || "",
      Start_Date: membership.Start_Date,
      End_Date: membership.End_Date || "",
    });
    setViewDialogOpen(true);
  };

  const handleEdit = () => {
    setViewDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setViewDialogOpen(false);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Present";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setFormData({
                Organization_Name: "",
                Membership_Type: "",
                Membership_ID: "",
                Start_Date: new Date().toISOString().split("T")[0],
              });
              setAddDialogOpen(true);
            }}
          >
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
                        {formatDate(membership.Start_Date)} -{" "}
                        {membership.End_Date
                          ? formatDate(membership.End_Date)
                          : "Present"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(membership)}
                      >
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

      {/* Add Membership Dialog */}
      <DialogForm
        title="Add Professional Membership"
        description="Add a new professional organization or society membership to your profile"
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Add Membership"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="Organization_Name">
              Organization Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="Organization_Name"
              name="Organization_Name"
              placeholder="Enter organization or society name"
              value={formData.Organization_Name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="Membership_Type">
              Membership Type <span className="text-red-500">*</span>
            </Label>
            <Input
              id="Membership_Type"
              name="Membership_Type"
              placeholder="E.g., Lifetime, Annual, Fellow"
              value={formData.Membership_Type}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="Membership_ID">Membership ID</Label>
            <Input
              id="Membership_ID"
              name="Membership_ID"
              placeholder="Enter membership ID (if any)"
              value={formData.Membership_ID}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="Start_Date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="Start_Date"
                name="Start_Date"
                type="date"
                value={formData.Start_Date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="End_Date">End Date</Label>
              <Input
                id="End_Date"
                name="End_Date"
                type="date"
                value={formData.End_Date}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500">
                Leave empty for lifetime/current memberships
              </p>
            </div>
          </div>
        </div>
      </DialogForm>

      {/* View Membership Dialog */}
      <DialogForm
        title="Membership Details"
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onSubmit={(e) => {
          e.preventDefault();
          setViewDialogOpen(false);
        }}
        submitLabel="Close"
        cancelLabel="Close"
      >
        {selectedMembership && (
          <div className="space-y-4">
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleEdit}
              >
                <Pencil size={14} />
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDeleteClick}
              >
                <Trash size={14} />
                Delete
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <p className="text-sm">{selectedMembership.Organization_Name}</p>
            </div>
            <div className="space-y-2">
              <Label>Membership Type</Label>
              <div className="inline-block px-2 py-1 text-sm bg-red-50 text-red-700 rounded">
                {selectedMembership.Membership_Type}
              </div>
            </div>
            {selectedMembership.Membership_ID && (
              <div className="space-y-2">
                <Label>Membership ID</Label>
                <p className="text-sm">{selectedMembership.Membership_ID}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <p className="text-sm">
                  {formatDate(selectedMembership.Start_Date)}
                </p>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <p className="text-sm">
                  {selectedMembership.End_Date
                    ? formatDate(selectedMembership.End_Date)
                    : "Present / Lifetime"}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogForm>

      {/* Edit Membership Dialog */}
      <DialogForm
        title="Edit Membership"
        description="Update the details of your professional membership"
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_org_name">
              Organization Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit_org_name"
              name="Organization_Name"
              placeholder="Enter organization or society name"
              value={formData.Organization_Name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_type">
              Membership Type <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit_type"
              name="Membership_Type"
              placeholder="E.g., Lifetime, Annual, Fellow"
              value={formData.Membership_Type}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_id">Membership ID</Label>
            <Input
              id="edit_id"
              name="Membership_ID"
              placeholder="Enter membership ID (if any)"
              value={formData.Membership_ID}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_start_date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_start_date"
                name="Start_Date"
                type="date"
                value={formData.Start_Date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_end_date">End Date</Label>
              <Input
                id="edit_end_date"
                name="End_Date"
                type="date"
                value={formData.End_Date}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500">
                Leave empty for lifetime/current memberships
              </p>
            </div>
          </div>
        </div>
      </DialogForm>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              membership from your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
