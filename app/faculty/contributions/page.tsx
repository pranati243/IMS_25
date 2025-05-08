"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/app/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Trash, Pencil, Folder, FileText, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Contribution {
  Contribution_ID: number;
  F_ID: number;
  Contribution_Type: string;
  Description: string;
  Contribution_Date: string;
}

interface ContributionFormData {
  Contribution_Type: string;
  Description: string;
  Contribution_Date: string;
}

export default function FacultyContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);
  const [formData, setFormData] = useState<ContributionFormData>({
    Contribution_Type: "",
    Description: "",
    Contribution_Date: new Date().toISOString().split("T")[0],
  });
  const router = useRouter();

  const contributionTypes = [
    "Curriculum Development",
    "Department Service",
    "College Service",
    "University Service",
    "Professional Service",
    "Community Service",
    "Guest Lecture",
    "Mentorship",
    "Educational Material",
    "Committee Work",
    "Other",
  ];

  useEffect(() => {
    fetchContributions();
  }, []);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.Contribution_Type ||
      !formData.Description ||
      !formData.Contribution_Date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/faculty/contributions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add contribution");
      }

      toast.success("Contribution added successfully");
      setAddDialogOpen(false);
      setFormData({
        Contribution_Type: "",
        Description: "",
        Contribution_Date: new Date().toISOString().split("T")[0],
      });

      // Refresh contributions list
      await fetchContributions();
    } catch (err) {
      console.error("Error adding contribution:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to add contribution"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedContribution) return;

    if (
      !formData.Contribution_Type ||
      !formData.Description ||
      !formData.Contribution_Date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/faculty/contributions/${selectedContribution.Contribution_ID}`,
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
        throw new Error(data.message || "Failed to update contribution");
      }

      toast.success("Contribution updated successfully");
      setEditDialogOpen(false);
      setSelectedContribution(null);

      // Refresh contributions list
      await fetchContributions();
    } catch (err) {
      console.error("Error updating contribution:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update contribution"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedContribution) return;

    try {
      const response = await fetch(
        `/api/faculty/contributions/${selectedContribution.Contribution_ID}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete contribution");
      }

      toast.success("Contribution deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedContribution(null);

      // Refresh contributions list
      await fetchContributions();
    } catch (err) {
      console.error("Error deleting contribution:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete contribution"
      );
    }
  };

  const handleViewDetails = (contribution: Contribution) => {
    setSelectedContribution(contribution);
    setFormData({
      Contribution_Type: contribution.Contribution_Type,
      Description: contribution.Description,
      Contribution_Date: contribution.Contribution_Date,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getContributionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "curriculum development":
        return <BookOpen className="h-4 w-4 text-emerald-600" />;
      case "department service":
      case "college service":
      case "university service":
      case "professional service":
      case "community service":
        return <FileText className="h-4 w-4 text-indigo-600" />;
      case "committee work":
        return <Folder className="h-4 w-4 text-amber-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

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
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setFormData({
                Contribution_Type: "",
                Description: "",
                Contribution_Date: new Date().toISOString().split("T")[0],
              });
              setAddDialogOpen(true);
            }}
          >
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
                    <div className="flex items-center gap-2">
                      {getContributionIcon(contribution.Contribution_Type)}
                      <h3 className="font-medium">
                        {contribution.Contribution_Type}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {contribution.Description.length > 200
                        ? `${contribution.Description.substring(0, 200)}...`
                        : contribution.Description}
                    </p>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(contribution.Contribution_Date)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(contribution)}
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

      {/* Add Contribution Dialog */}
      <DialogForm
        title="Add Contribution"
        description="Add a new academic or professional contribution to your profile"
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Add Contribution"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="Contribution_Type">
              Contribution Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.Contribution_Type}
              onValueChange={(value) =>
                handleSelectChange("Contribution_Type", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contribution type" />
              </SelectTrigger>
              <SelectContent>
                {contributionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="Description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="Description"
              name="Description"
              placeholder="Describe your contribution in detail"
              value={formData.Description}
              onChange={handleInputChange}
              required
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="Contribution_Date">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="Contribution_Date"
              name="Contribution_Date"
              type="date"
              value={formData.Contribution_Date}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
      </DialogForm>

      {/* View Contribution Dialog */}
      <DialogForm
        title="Contribution Details"
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onSubmit={(e) => {
          e.preventDefault();
          setViewDialogOpen(false);
        }}
        submitLabel="Close"
        cancelLabel="Close"
      >
        {selectedContribution && (
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
              <Label>Contribution Type</Label>
              <div className="flex items-center gap-2">
                {getContributionIcon(selectedContribution.Contribution_Type)}
                <p className="text-sm font-medium">
                  {selectedContribution.Contribution_Type}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <p className="text-sm whitespace-pre-wrap">
                {selectedContribution.Description}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <p className="text-sm">
                {formatDate(selectedContribution.Contribution_Date)}
              </p>
            </div>
          </div>
        )}
      </DialogForm>

      {/* Edit Contribution Dialog */}
      <DialogForm
        title="Edit Contribution"
        description="Update the details of your contribution"
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_type">
              Contribution Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.Contribution_Type}
              onValueChange={(value) =>
                handleSelectChange("Contribution_Type", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contribution type" />
              </SelectTrigger>
              <SelectContent>
                {contributionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="edit_description"
              name="Description"
              placeholder="Describe your contribution in detail"
              value={formData.Description}
              onChange={handleInputChange}
              required
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_date">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit_date"
              name="Contribution_Date"
              type="date"
              value={formData.Contribution_Date}
              onChange={handleInputChange}
              required
            />
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
              contribution from your profile.
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
