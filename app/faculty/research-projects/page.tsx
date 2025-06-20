"use client";

import { useState, useEffect } from "react";
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
import { Plus, Target, Trash, Pencil } from "lucide-react";
import { toast } from "sonner";

interface ResearchProject {
  id: number;
  faculty_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  status: "ongoing" | "completed" | "planned";
  funding_agency: string | null;
  funding_amount: number | null;
}

interface ProjectFormData {
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  status: "ongoing" | "completed" | "planned";
  funding_agency?: string;
  funding_amount?: string;
}

export default function FacultyResearchProjectsPage() {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ResearchProject | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    start_date: new Date().toISOString().split("T")[0],
    status: "ongoing",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

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
        err instanceof Error ? err.message : "Failed to load research projects"
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
    e.preventDefault(); // Check for required fields based on server error message
    if (!formData.title) {
      toast.error("Project title is required");
      return;
    }

    if (!formData.start_date) {
      toast.error("Start date is required");
      return;
    }

    // Make description optional to match server validation
    // if (!formData.description) {
    //   toast.error("Description is required");
    //   return;
    // }

    // Other required fields
    if (!formData.status) {
      toast.error("Project status is required");
      return;
    }
    try {
      setIsSubmitting(true);

      // Make sure empty fields are null instead of empty strings for the backend
      const cleanedFormData = { ...formData };
      // Set empty strings to null/undefined
      Object.keys(cleanedFormData).forEach((key) => {
        // Skip the status field since it can't be undefined
        if (key === "status") return;

        if (cleanedFormData[key as keyof typeof cleanedFormData] === "") {
          // Use type assertion to handle the TypeScript error
          (cleanedFormData as any)[key] = undefined;
        }
      });
      const payload = {
        ...cleanedFormData,
        // Convert field names to match API expectations
        title: formData.title.trim(),
        startDate: formData.start_date, // Changed from start_date to startDate
        endDate: formData.end_date || undefined, // Changed from end_date to endDate
        status: formData.status,
        fundingAgency: formData.funding_agency || undefined, // Changed from funding_agency to fundingAgency
        // Handle numbers properly
        fundingAmount: formData.funding_amount // Changed from funding_amount to fundingAmount
          ? parseFloat(formData.funding_amount)
          : undefined,
      };

      console.log(
        "Submitting research project payload:",
        JSON.stringify(payload, null, 2)
      );

      const response = await fetch("/api/faculty/research-projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("API Error:", data);
        throw new Error(data.message || "Failed to add research project");
      }
      toast.success("Research project added successfully");
      setAddDialogOpen(false);

      // Reset form to default state
      setFormData({
        title: "",
        description: "",
        start_date: new Date().toISOString().split("T")[0],
        status: "ongoing",
      });

      // Refresh projects list
      await fetchProjects();
    } catch (err) {
      console.error("Error adding research project:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to add research project"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) return;

    if (
      !formData.title ||
      !formData.description ||
      !formData.start_date ||
      !formData.status
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        ...formData,
        funding_amount: formData.funding_amount
          ? parseFloat(formData.funding_amount)
          : null,
      };

      const response = await fetch(
        `/api/faculty/research-projects/${selectedProject.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update research project");
      }

      toast.success("Research project updated successfully");
      setEditDialogOpen(false);
      setSelectedProject(null);

      // Refresh projects list
      await fetchProjects();
    } catch (err) {
      console.error("Error updating research project:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update research project"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(
        `/api/faculty/research-projects/${selectedProject.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete research project");
      }

      toast.success("Research project deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedProject(null);

      // Refresh projects list
      await fetchProjects();
    } catch (err) {
      console.error("Error deleting research project:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete research project"
      );
    }
  };

  const handleViewDetails = (project: ResearchProject) => {
    setSelectedProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      start_date: project.start_date,
      end_date: project.end_date || undefined,
      status: project.status,
      funding_agency: project.funding_agency || undefined,
      funding_amount: project.funding_amount
        ? project.funding_amount.toString()
        : undefined,
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

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
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
              Research Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your ongoing and completed research projects
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setFormData({
                title: "",
                description: "",
                start_date: new Date().toISOString().split("T")[0],
                status: "ongoing",
              });
              setAddDialogOpen(true);
            }}
          >
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
                      {project.description.length > 150
                        ? `${project.description.substring(0, 150)}...`
                        : project.description}
                    </p>
                    <div className="flex justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {formatDate(project.start_date)} -{" "}
                        {project.end_date
                          ? formatDate(project.end_date)
                          : "Present"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(project)}
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

      {/* Add Project Dialog */}
      <DialogForm
        title="Add Research Project"
        description="Add a new research project to your profile"
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Add Project"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Project Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter the title of your research project"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            {" "}
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter a description of the research project"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="funding_agency">Funding Agency</Label>
              <Input
                id="funding_agency"
                name="funding_agency"
                placeholder="Enter funding agency name"
                value={formData.funding_agency || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="funding_amount">Funding Amount (₹)</Label>
              <Input
                id="funding_amount"
                name="funding_amount"
                type="number"
                min="0"
                step="1000"
                placeholder="Enter amount in rupees"
                value={formData.funding_amount || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      </DialogForm>

      {/* View Project Dialog */}
      <DialogForm
        title="Project Details"
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onSubmit={(e) => {
          e.preventDefault();
          setViewDialogOpen(false);
        }}
        submitLabel="Close"
        cancelLabel="Close"
      >
        {selectedProject && (
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
              <Label>Project Title</Label>
              <p className="text-sm">{selectedProject.title}</p>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <p className="text-sm">{selectedProject.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <p className="text-sm">
                  {formatDate(selectedProject.start_date)}
                </p>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <p className="text-sm">
                  {selectedProject.end_date
                    ? formatDate(selectedProject.end_date)
                    : "Present / Ongoing"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div
                className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  selectedProject.status === "ongoing"
                    ? "bg-blue-100 text-blue-800"
                    : selectedProject.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {selectedProject.status.charAt(0).toUpperCase() +
                  selectedProject.status.slice(1)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Funding Agency</Label>
                <p className="text-sm">
                  {selectedProject.funding_agency || "Not specified"}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Funding Amount</Label>
                <p className="text-sm">
                  {selectedProject.funding_amount
                    ? formatCurrency(selectedProject.funding_amount)
                    : "Not specified"}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogForm>

      {/* Edit Project Dialog */}
      <DialogForm
        title="Edit Research Project"
        description="Update the details of your research project"
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_title">
              Project Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit_title"
              name="title"
              placeholder="Enter the title of your research project"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="edit_description"
              name="description"
              placeholder="Enter a description of the research project"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_start_date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_end_date">End Date</Label>
              <Input
                id="edit_end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                handleSelectChange(
                  "status",
                  value as "ongoing" | "completed" | "planned"
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_funding_agency">Funding Agency</Label>
              <Input
                id="edit_funding_agency"
                name="funding_agency"
                placeholder="Enter funding agency name"
                value={formData.funding_agency || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_funding_amount">Funding Amount (₹)</Label>
              <Input
                id="edit_funding_amount"
                name="funding_amount"
                type="number"
                min="0"
                step="1000"
                placeholder="Enter amount in rupees"
                value={formData.funding_amount || ""}
                onChange={handleInputChange}
              />
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
              This action cannot be undone. This will permanently delete the
              research project from your profile.
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
