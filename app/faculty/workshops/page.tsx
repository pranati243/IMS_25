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
import { Plus, CalendarDays, Trash, Pencil, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Workshop {
  id: number;
  faculty_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  venue: string;
  type: "workshop" | "conference" | "seminar";
  role: "attendee" | "presenter" | "organizer";
}

interface WorkshopFormData {
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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(
    null
  );
  const [formData, setFormData] = useState<WorkshopFormData>({
    title: "",
    description: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "", // ✅ instead of omitting it
    venue: "",
    type: "workshop",
    role: "attendee",
  });

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/faculty/workshops");

      if (!response.ok) {
        throw new Error("Failed to fetch workshops");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch workshops");
      }

      setWorkshops(data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching workshops:", err);
      setError(err instanceof Error ? err.message : "Failed to load workshops");
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
      !formData.title ||
      !formData.description ||
      !formData.start_date ||
      !formData.venue ||
      !formData.type ||
      !formData.role
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/faculty/workshops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add workshop");
      }

      toast.success("Workshop added successfully");
      setAddDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        start_date: new Date().toISOString().split("T")[0],
        venue: "",
        type: "workshop",
        role: "attendee",
      });

      // Refresh workshops list
      await fetchWorkshops();
    } catch (err) {
      console.error("Error adding workshop:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to add workshop"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWorkshop) return;

    if (
      !formData.title ||
      !formData.description ||
      !formData.start_date ||
      !formData.venue ||
      !formData.type ||
      !formData.role
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/faculty/workshops/${selectedWorkshop.id}`,
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
        throw new Error(data.message || "Failed to update workshop");
      }

      toast.success("Workshop updated successfully");
      setEditDialogOpen(false);
      setSelectedWorkshop(null);

      // Refresh workshops list
      await fetchWorkshops();
    } catch (err) {
      console.error("Error updating workshop:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update workshop"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

const handleDelete = async () => {
  if (!selectedWorkshop) return;

  try {
    const response = await fetch(
      `/api/faculty/workshops/${selectedWorkshop.id}`,
      { method: "DELETE" }
    );

    let data = {};
    try {
      data = await response.json();
    } catch {
      // ignore JSON parse error if body is empty
    }

    if (!response.ok || !(data as any).success) {
      throw new Error((data as any).message || "Failed to delete workshop");
    }

    toast.success("Workshop deleted successfully");
    setDeleteDialogOpen(false);
    setSelectedWorkshop(null);
    await fetchWorkshops(); // refresh list
  } catch (err) {
    console.error("Error deleting workshop:", err);
    toast.error(
      err instanceof Error ? err.message : "Failed to delete workshop"
    );
  }
};


  const handleViewDetails = (workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setFormData({
      title: workshop.title,
      description: workshop.description,
      start_date: workshop.start_date,
      end_date: workshop.end_date ?? "",//end_date: workshop.end_date || undefined,
      venue: workshop.venue,
      type: workshop.type,
      role: workshop.role,
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "workshop":
        return "Workshop";
      case "conference":
        return "Conference";
      case "seminar":
        return "Seminar";
      default:
        return type;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "attendee":
        return "Attendee";
      case "presenter":
        return "Presenter";
      case "organizer":
        return "Organizer";
      default:
        return role;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "workshop":
        return "bg-blue-100 text-blue-800";
      case "conference":
        return "bg-purple-100 text-purple-800";
      case "seminar":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "attendee":
        return "bg-gray-100 text-gray-800";
      case "presenter":
        return "bg-amber-100 text-amber-800";
      case "organizer":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
              Manage your workshops, conferences, and seminars
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setFormData({
                title: "",
                description: "",
                start_date: new Date().toISOString().split("T")[0],
                venue: "",
                type: "workshop",
                role: "attendee",
              });
              setAddDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Event
          </Button>
        </div>

        {/* Main content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Your Workshops & Conferences
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
                    <div className="flex flex-col sm:flex-row justify-between gap-2">
                      <h3 className="font-medium">{workshop.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getTypeColor(
                            workshop.type
                          )}`}
                        >
                          {getTypeLabel(workshop.type)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getRoleColor(
                            workshop.role
                          )}`}
                        >
                          {getRoleLabel(workshop.role)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      {workshop.venue}
                    </div>
                    <div className="flex justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {formatDate(workshop.start_date)} -{" "}
                        {workshop.end_date
                          ? formatDate(workshop.end_date)
                          : "Present"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(workshop)}
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

      {/* Add Workshop Dialog */}
      <DialogForm
        title="Add Event"
        description="Add a new workshop, conference, or seminar to your profile"
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Add Event"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Event Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter the title of the workshop or conference"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter a description of the event"
              value={formData.description}
              onChange={handleInputChange}
              required
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
            <Label htmlFor="venue">
              Venue <span className="text-red-500">*</span>
            </Label>
            <Input
              id="venue"
              name="venue"
              placeholder="Enter the venue location"
              value={formData.venue}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">
                Event Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">
                Your Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendee">Attendee</SelectItem>
                  <SelectItem value="presenter">Presenter</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogForm>

      {/* View Workshop Dialog */}
      <DialogForm
        title="Event Details"
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onSubmit={(e) => {
          e.preventDefault();
          setViewDialogOpen(false);
        }}
        submitLabel="Close"
        cancelLabel="Close"
      >
        {selectedWorkshop && (
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
              <Label>Event Title</Label>
              <p className="text-sm">{selectedWorkshop.title}</p>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <p className="text-sm">{selectedWorkshop.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <p className="text-sm">
                  {formatDate(selectedWorkshop.start_date)}
                </p>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <p className="text-sm">
                  {selectedWorkshop.end_date
                    ? formatDate(selectedWorkshop.end_date)
                    : "Not specified"}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Venue</Label>
              <p className="text-sm">{selectedWorkshop.venue}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Type</Label>
                <div
                  className={`inline-flex px-2 py-1 text-xs rounded-full ${getTypeColor(
                    selectedWorkshop.type
                  )}`}
                >
                  {getTypeLabel(selectedWorkshop.type)}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Your Role</Label>
                <div
                  className={`inline-flex px-2 py-1 text-xs rounded-full ${getRoleColor(
                    selectedWorkshop.role
                  )}`}
                >
                  {getRoleLabel(selectedWorkshop.role)}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogForm>

      {/* Edit Workshop Dialog */}
      <DialogForm
        title="Edit Event"
        description="Update the details of your workshop, conference, or seminar"
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_title">
              Event Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit_title"
              name="title"
              placeholder="Enter the title of the workshop or conference"
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
              placeholder="Enter a description of the event"
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
            <Label htmlFor="edit_venue">
              Venue <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit_venue"
              name="venue"
              placeholder="Enter the venue location"
              value={formData.venue}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_type">
                Event Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  handleSelectChange(
                    "type",
                    value as "workshop" | "conference" | "seminar"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_role">
                Your Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  handleSelectChange(
                    "role",
                    value as "attendee" | "presenter" | "organizer"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendee">Attendee</SelectItem>
                  <SelectItem value="presenter">Presenter</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                </SelectContent>
              </Select>
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
              event from your profile.
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
