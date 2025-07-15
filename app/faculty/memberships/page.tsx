"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/app/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  SrNo: number; // This is actually membership_id
  F_ID: string; // This is actually faculty_id
  organization: string;
  Membership_Type: string; // This is actually membership_type
  Membership_ID: string; // new
  certificate_url: string; // new
  Start_Date: string; // This is actually start_date
  End_Date?: string; // This is actually end_date
  description?: string;
}

interface MembershipFormData {
  organization: string;
  organizationCategory: string; // new
  organizationOther?: string; // new
  Membership_Type: string;
  Membership_Type_Other?: string; // new
  Membership_ID: string;
  certificateFile: File | null;
  certificate_url?: string;
  Start_Date: string;
  End_Date?: string;
  description?: string;
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
    organization: "",
    organizationCategory: "National",
    organizationOther: "",
    Membership_Type: "",
    Membership_Type_Other: "",
    Membership_ID: "",
    certificateFile: null,
    Start_Date: new Date().toISOString().split("T")[0],
    End_Date: "",
    description: ""
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, files } = e.target as any;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, certificateFile: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.organization ||
      !formData.Membership_Type ||
      !formData.Membership_ID ||
      !formData.certificateFile ||
      !formData.Start_Date
    ) {
      toast.error("Please fill in all required fields, including Membership ID and Certificate");
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Upload certificate file
      const certForm = new FormData();
      certForm.append("file", formData.certificateFile);
      // TODO: Replace with your actual upload endpoint
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: certForm,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error("Certificate upload failed");
      }
      // 2. Submit membership data
      const payload = {
        organization: formData.organization === "Others" || formData.organizationCategory === "Others"
          ? formData.organizationOther
          : formData.organization,
        organizationCategory: formData.organizationCategory,
        Membership_Type: formData.Membership_Type === "Others"
          ? formData.Membership_Type_Other
          : formData.Membership_Type,
        Membership_ID: formData.Membership_ID,
        certificate_url: uploadData.url,
        Start_Date: formData.Start_Date,
        End_Date: formData.End_Date || null,
        description: formData.description || "Faculty membership"
      };
      const response = await fetch("/api/faculty/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add membership");
      }
      toast.success("Membership added successfully");
      setAddDialogOpen(false);
      setFormData({
        organization: "",
        organizationCategory: "National",
        organizationOther: "",
        Membership_Type: "",
        Membership_Type_Other: "",
        Membership_ID: "",
        certificateFile: null,
        Start_Date: new Date().toISOString().split("T")[0],
        End_Date: "",
        description: ""
      });
      await fetchMemberships();
    } catch (err) {
      console.error("Error adding membership:", err);
      toast.error(err instanceof Error ? err.message : "Failed to add membership");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMembership) return;

    if (
      !formData.organization ||
      !formData.Membership_Type ||
      !formData.Start_Date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        organization: formData.organization,
        Membership_Type: formData.Membership_Type,
        Start_Date: formData.Start_Date,
        End_Date: formData.End_Date || null,
        description: formData.description || "Faculty membership"
      };

      const response = await fetch(
        `/api/faculty/memberships/${selectedMembership.SrNo}`,
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
      organization: membership.organization,
      organizationCategory: "National", // or infer if you have the info
      organizationOther: "",
      Membership_Type: membership.Membership_Type,
      Membership_Type_Other: "",
      Membership_ID: membership.Membership_ID || "",
      certificateFile: null,
      Start_Date: membership.Start_Date,
      End_Date: membership.End_Date || "",
      description: membership.description || ""
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

  const ORGANIZATION_CATEGORIES = ["National", "International", "Others"];
  const ORGANIZATIONS: Record<string, { value: string; label: string }[]> = {
    National: [
      { value: "ISTE", label: "ISTE – Indian Society for Technical Education" },
      { value: "IEI", label: "IEI – Institution of Engineers (India)" },
      { value: "IETE", label: "IETE – Institution of Electronics and Telecommunication Engineers" },
      { value: "CSI", label: "CSI – Computer Society of India" },
      { value: "ISME", label: "ISME – Indian Society for Mechanical Engineers" },
      { value: "IET India", label: "IET India – Institution of Engineering and Technology (India Chapter)" },
      { value: "IEEE India Council", label: "IEEE India Council – Institute of Electrical and Electronics Engineers (India Council)" },
      { value: "INAE", label: "INAE – Indian National Academy of Engineering" },
      { value: "ACM India", label: "ACM India – Association for Computing Machinery (India Chapter)" },
      { value: "SAEINDIA", label: "SAEINDIA – Society of Automotive Engineers India" },
      { value: "ISTD", label: "ISTD – Indian Society for Training and Development" },
      { value: "NAAC/NBA Panel Expert", label: "NAAC/NBA Panel Expert – National Assessment and Accreditation Council / National Board of Accreditation" },
    ],
    International: [
      { value: "IEEE", label: "IEEE – Institute of Electrical and Electronics Engineers" },
      { value: "ACM", label: "ACM – Association for Computing Machinery" },
      { value: "ASME", label: "ASME – American Society of Mechanical Engineers" },
      { value: "ASCE", label: "ASCE – American Society of Civil Engineers" },
      { value: "SAE International", label: "SAE International – Society of Automotive Engineers (International)" },
      { value: "IFAC", label: "IFAC – International Federation of Automatic Control" },
      { value: "INFORMS", label: "INFORMS – Institute for Operations Research and the Management Sciences" },
      { value: "AAAI", label: "AAAI – Association for the Advancement of Artificial Intelligence" },
      { value: "IAENG", label: "IAENG – International Association of Engineers" },
    ],
  };
  const MEMBERSHIP_TYPES = ["Senior Member", "Professional Member", "Fellow", "Others"];

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
                organization: "",
                organizationCategory: "National",
                organizationOther: "",
                Membership_Type: "",
                Membership_Type_Other: "",
                Membership_ID: "",
                certificateFile: null,
                Start_Date: new Date().toISOString().split("T")[0],
                End_Date: "",
                description: ""
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
                        {membership.organization}
                      </h3>
                      <span className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded">
                        {membership.Membership_Type}
                      </span>
                    </div>
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
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="organizationCategory">
              Organisation Category <span className="text-red-500">*</span>
            </Label>
            <select
              id="organizationCategory"
              name="organizationCategory"
              value={formData.organizationCategory}
              onChange={handleInputChange}
              required
              className="w-full border rounded px-2 py-1"
            >
              {ORGANIZATION_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {formData.organizationCategory === "Others" && (
              <Input
                id="organizationOther"
                name="organizationOther"
                placeholder="Specify other category"
                value={formData.organizationOther}
                onChange={handleInputChange}
                required
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization">
              Organisation Name <span className="text-red-500">*</span>
            </Label>
            {formData.organizationCategory !== "Others" ? (
              <select
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                required
                className="w-full border rounded px-2 py-1"
              >
                <option value="">Select organisation</option>
                {ORGANIZATIONS[formData.organizationCategory]?.map((org: { value: string; label: string }) => (
                  <option key={org.value} value={org.value}>{org.label}</option>
                ))}
                <option value="Others">Others (Specify)</option>
              </select>
            ) : null}
            {(formData.organizationCategory === "Others" || formData.organization === "Others") && (
              <Input
                id="organizationOther"
                name="organizationOther"
                placeholder="Specify other organisation"
                value={formData.organizationOther}
                onChange={handleInputChange}
                required
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="Membership_Type">
              Membership Type <span className="text-red-500">*</span>
            </Label>
            <select
              id="Membership_Type"
              name="Membership_Type"
              value={formData.Membership_Type}
              onChange={handleInputChange}
              required
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Select type</option>
              {MEMBERSHIP_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {formData.Membership_Type === "Others" && (
              <Input
                id="Membership_Type_Other"
                name="Membership_Type_Other"
                placeholder="Specify other type"
                value={formData.Membership_Type_Other}
                onChange={handleInputChange}
                required
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter a description for this membership"
              value={formData.description}
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
          <div className="space-y-2">
            <Label htmlFor="Membership_ID">
              Membership ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="Membership_ID"
              name="Membership_ID"
              placeholder="Enter membership ID"
              value={formData.Membership_ID}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certificateFile">
              Membership Certificate <span className="text-red-500">*</span>
            </Label>
            <Input
              id="certificateFile"
              name="certificateFile"
              type="file"
              accept="application/pdf,image/*"
              onChange={handleInputChange}
              required
            />
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
              <p className="text-sm">{selectedMembership.organization}</p>
            </div>
            <div className="space-y-2">
              <Label>Membership Type</Label>
              <div className="inline-block px-2 py-1 text-sm bg-red-50 text-red-700 rounded">
                {selectedMembership.Membership_Type}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <p className="text-sm">{selectedMembership.description || "No description available"}</p>
            </div>
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
            <div className="space-y-2">
              <Label>Membership ID</Label>
              <p className="text-sm">{selectedMembership.Membership_ID}</p>
            </div>
            <div className="space-y-2">
              <Label>Certificate</Label>
              <a
                href={selectedMembership.certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Certificate
              </a>
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
              name="organization"
              placeholder="Enter organization or society name"
              value={formData.organization}
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
            <Label htmlFor="edit_description">Description</Label>
            <Textarea
              id="edit_description"
              name="description"
              placeholder="Enter a description for this membership"
              value={formData.description}
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
