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
import { Plus, BookOpen, Trash, Pencil, Link } from "lucide-react";
import { toast } from "sonner";

interface Publication {
  id: number;
  faculty_id: string;
  title: string;
  abstract: string | null;
  authors: string;
  publication_date: string;
  publication_type:
    | "journal"
    | "conference"
    | "book"
    | "book_chapter"
    | "other";
  publication_venue: string;
  doi: string | null;
  url: string | null;
  citation_count: number | null;
}

interface PublicationFormData {
  title: string;
  abstract?: string;
  authors: string;
  publication_date: string;
  publication_type:
    | "journal"
    | "conference"
    | "book"
    | "book_chapter"
    | "other";
  publication_venue: string;
  doi?: string;
  url?: string;
  citation_count?: string;
}

export default function FacultyPublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);
  const [formData, setFormData] = useState<PublicationFormData>({
    title: "",
    authors: "",
    publication_date: new Date().toISOString().split("T")[0],
    publication_type: "journal",
    publication_venue: "",
  });

  useEffect(() => {
    fetchPublications();
  }, []);

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
      !formData.authors ||
      !formData.publication_date ||
      !formData.publication_type ||
      !formData.publication_venue
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        ...formData,
        citation_count: formData.citation_count
          ? parseInt(formData.citation_count)
          : null,
      };

      const response = await fetch("/api/faculty/publications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add publication");
      }

      toast.success("Publication added successfully");
      setAddDialogOpen(false);
      setFormData({
        title: "",
        authors: "",
        publication_date: new Date().toISOString().split("T")[0],
        publication_type: "journal",
        publication_venue: "",
      });

      // Refresh publications list
      await fetchPublications();
    } catch (err) {
      console.error("Error adding publication:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to add publication"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPublication) return;

    if (
      !formData.title ||
      !formData.authors ||
      !formData.publication_date ||
      !formData.publication_type ||
      !formData.publication_venue
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        id: selectedPublication.id, // Include the ID in the request body
        ...formData,
        citation_count: formData.citation_count
          ? parseInt(formData.citation_count)
          : null,
      };

      const response = await fetch(`/api/faculty/publications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update publication");
      }

      toast.success("Publication updated successfully");
      setEditDialogOpen(false);
      setSelectedPublication(null);

      // Refresh publications list
      await fetchPublications();
    } catch (err) {
      console.error("Error updating publication:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update publication"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPublication) return;

    try {
      setIsDeleting(true);

      const response = await fetch(
        `/api/faculty/publications?id=${selectedPublication.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete publication");
      }

      toast.success("Publication deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedPublication(null);

      // Refresh publications list
      await fetchPublications();
    } catch (err) {
      console.error("Error deleting publication:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete publication"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = (publication: Publication) => {
    setSelectedPublication(publication);
    setFormData({
      title: publication.title,
      abstract: publication.abstract || undefined,
      authors: publication.authors,
      publication_date: publication.publication_date,
      publication_type: publication.publication_type,
      publication_venue: publication.publication_venue,
      doi: publication.doi || undefined,
      url: publication.url || undefined,
      citation_count: publication.citation_count
        ? publication.citation_count.toString()
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not provided";

    // Try to parse the date
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPublicationTypeLabel = (type: string) => {
    switch (type) {
      case "journal":
        return "Journal Article";
      case "conference":
        return "Conference Paper";
      case "book":
        return "Book";
      case "book_chapter":
        return "Book Chapter";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  const getPublicationTypeColor = (type: string) => {
    switch (type) {
      case "journal":
        return "bg-blue-100 text-blue-800";
      case "conference":
        return "bg-purple-100 text-purple-800";
      case "book":
        return "bg-green-100 text-green-800";
      case "book_chapter":
        return "bg-emerald-100 text-emerald-800";
      case "other":
        return "bg-gray-100 text-gray-800";
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
              Publications
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your research publications and scholarly works
            </p>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setFormData({
                title: "",
                authors: "",
                publication_date: new Date().toISOString().split("T")[0],
                publication_type: "journal",
                publication_venue: "",
              });
              setAddDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Publication
          </Button>
        </div>

        {/* Main content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
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
                    <div className="flex justify-between mb-2">
                      <div
                        className={`px-2 py-1 text-xs rounded-full ${getPublicationTypeColor(
                          publication.publication_type
                        )}`}
                      >
                        {getPublicationTypeLabel(publication.publication_type)}
                      </div>
                      {publication.citation_count && (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">
                          {publication.citation_count}{" "}
                          {publication.citation_count === 1
                            ? "citation"
                            : "citations"}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium">{publication.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {publication.authors}
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      {publication.publication_venue},{" "}
                      {formatDate(publication.publication_date)}
                    </div>
                    <div className="flex justify-between mt-3">
                      <div className="flex items-center gap-2">
                        {publication.doi && (
                          <a
                            href={`https://doi.org/${publication.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            <Link className="h-3 w-3" />
                            DOI
                          </a>
                        )}
                        {publication.url && (
                          <a
                            href={publication.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            <Link className="h-3 w-3" />
                            URL
                          </a>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(publication)}
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

      {/* Add Publication Dialog */}
      <DialogForm
        title="Add Publication"
        description="Add a new research publication to your profile"
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Add Publication"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter the title of your publication"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="authors">
              Authors <span className="text-red-500">*</span>
            </Label>
            <Input
              id="authors"
              name="authors"
              placeholder="Enter authors (e.g., Smith, J., Jones, A.)"
              value={formData.authors}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="abstract">Abstract</Label>
            <Textarea
              id="abstract"
              name="abstract"
              placeholder="Enter the abstract of your publication"
              value={formData.abstract || ""}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publication_date">
                Publication Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="publication_date"
                name="publication_date"
                type="date"
                value={formData.publication_date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publication_type">
                Publication Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.publication_type}
                onValueChange={(value) =>
                  handleSelectChange("publication_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="journal">Journal Article</SelectItem>
                  <SelectItem value="conference">Conference Paper</SelectItem>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="book_chapter">Book Chapter</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="publication_venue">
              Publication Venue <span className="text-red-500">*</span>
            </Label>
            <Input
              id="publication_venue"
              name="publication_venue"
              placeholder="Journal name, conference name, book title, etc."
              value={formData.publication_venue}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doi">DOI</Label>
              <Input
                id="doi"
                name="doi"
                placeholder="Enter DOI (e.g., 10.1000/xyz123)"
                value={formData.doi || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                placeholder="Enter URL"
                value={formData.url || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="citation_count">Citation Count</Label>
            <Input
              id="citation_count"
              name="citation_count"
              type="number"
              min="0"
              placeholder="Number of citations"
              value={formData.citation_count || ""}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </DialogForm>

      {/* View Publication Dialog */}
      <DialogForm
        title="Publication Details"
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        onSubmit={(e) => {
          e.preventDefault();
          setViewDialogOpen(false);
        }}
        submitLabel="Close"
        showCancel={false}
      >
        {selectedPublication && (
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
              <Label>Title</Label>
              <p className="text-sm">{selectedPublication.title}</p>
            </div>
            <div className="space-y-2">
              <Label>Authors</Label>
              <p className="text-sm">{selectedPublication.authors}</p>
            </div>
            {selectedPublication.abstract && (
              <div className="space-y-2">
                <Label>Abstract</Label>
                <p className="text-sm">{selectedPublication.abstract}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Publication Date</Label>
                <p className="text-sm">
                  {formatDate(selectedPublication.publication_date)}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Publication Type</Label>
                <div
                  className={`inline-flex px-2 py-1 text-xs rounded-full ${getPublicationTypeColor(
                    selectedPublication.publication_type
                  )}`}
                >
                  {getPublicationTypeLabel(
                    selectedPublication.publication_type
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Publication Venue</Label>
              <p className="text-sm">{selectedPublication.publication_venue}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>DOI</Label>
                {selectedPublication.doi ? (
                  <a
                    href={`https://doi.org/${selectedPublication.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    {selectedPublication.doi}
                    <Link className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">Not provided</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                {selectedPublication.url ? (
                  <a
                    href={selectedPublication.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    Visit Link
                    <Link className="h-3 w-3" />
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">Not provided</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Citation Count</Label>
              <p className="text-sm">
                {selectedPublication.citation_count !== null &&
                selectedPublication.citation_count !== undefined
                  ? `${selectedPublication.citation_count} ${
                      selectedPublication.citation_count === 1
                        ? "citation"
                        : "citations"
                    }`
                  : "Not provided"}
              </p>
            </div>
          </div>
        )}
      </DialogForm>

      {/* Edit Publication Dialog */}
      <DialogForm
        title="Edit Publication"
        description="Update the details of your research publication"
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Save Changes"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit_title"
              name="title"
              placeholder="Enter the title of your publication"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_authors">
              Authors <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit_authors"
              name="authors"
              placeholder="Enter authors (e.g., Smith, J., Jones, A.)"
              value={formData.authors}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_abstract">Abstract</Label>
            <Textarea
              id="edit_abstract"
              name="abstract"
              placeholder="Enter the abstract of your publication"
              value={formData.abstract || ""}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_publication_date">
                Publication Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_publication_date"
                name="publication_date"
                type="date"
                value={formData.publication_date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_publication_type">
                Publication Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.publication_type}
                onValueChange={(value) =>
                  handleSelectChange(
                    "publication_type",
                    value as
                      | "journal"
                      | "conference"
                      | "book"
                      | "book_chapter"
                      | "other"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="journal">Journal Article</SelectItem>
                  <SelectItem value="conference">Conference Paper</SelectItem>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="book_chapter">Book Chapter</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_publication_venue">
              Publication Venue <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit_publication_venue"
              name="publication_venue"
              placeholder="Journal name, conference name, book title, etc."
              value={formData.publication_venue}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_doi">DOI</Label>
              <Input
                id="edit_doi"
                name="doi"
                placeholder="Enter DOI (e.g., 10.1000/xyz123)"
                value={formData.doi || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_url">URL</Label>
              <Input
                id="edit_url"
                name="url"
                placeholder="Enter URL"
                value={formData.url || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_citation_count">Citation Count</Label>
            <Input
              id="edit_citation_count"
              name="citation_count"
              type="number"
              min="0"
              placeholder="Number of citations"
              value={formData.citation_count || ""}
              onChange={handleInputChange}
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
              This action cannot be undone. This will permanently delete the
              publication from your profile.
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
