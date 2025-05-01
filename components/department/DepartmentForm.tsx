"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Form validation schema
const departmentFormSchema = z.object({
  Department_Name: z.string().min(2, "Name must be at least 2 characters"),
  Establishment_Year: z.string().refine(
    (year) => !year || /^\d{4}$/.test(year),
    { message: "Year must be in YYYY format" }
  ).nullable().transform(val => val === "" ? null : val),
  Department_Code: z.string().min(1, "Department code is required"),
  Email_ID: z.string().email("Invalid email address").or(z.literal("")),
  Department_Phone_Number: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits").or(z.literal("")),
  HOD_ID: z.string().nullable().transform(val => val === "" ? null : val),
  Vision: z.string().optional(),
  Mission: z.string().optional(),
  Total_Faculty: z.string().refine(
    (val) => !val || /^\d+$/.test(val),
    { message: "Must be a number" }
  ).transform(val => val === "" ? "0" : val),
  Total_Students: z.string().refine(
    (val) => !val || /^\d+$/.test(val),
    { message: "Must be a number" }
  ).transform(val => val === "" ? "0" : val),
  Website_URL: z.string().url("Invalid URL").or(z.literal("")),
  Notable_Achievements: z.string().optional(),
  Industry_Collaboration: z.string().optional(),
  Research_Focus_Area: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

interface DepartmentFormProps {
  onClose: () => void;
  initialData?: any;
  isEditing?: boolean;
  departmentId?: number;
}

interface FacultyOption {
  id: number;
  name: string;
}

export function DepartmentForm({
  onClose,
  initialData,
  isEditing = false,
  departmentId
}: DepartmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [facultyOptions, setFacultyOptions] = useState<FacultyOption[]>([]);

  // Load faculty list for HOD selection
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await fetch('/api/faculty');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const options = data.data.map((faculty: any) => ({
              id: faculty.F_id,
              name: faculty.F_name
            }));
            setFacultyOptions(options);
          }
        }
      } catch (error) {
        console.error("Error fetching faculty options:", error);
      }
    };

    fetchFaculty();
  }, []);

  // Process the initial data
  const processedInitialData = initialData ? {
    ...initialData,
    HOD_ID: initialData.HOD_ID ? String(initialData.HOD_ID) : "",
    Establishment_Year: initialData.Establishment_Year ? String(initialData.Establishment_Year) : "",
    Total_Faculty: initialData.Total_Faculty ? String(initialData.Total_Faculty) : "0",
    Total_Students: initialData.Total_Students ? String(initialData.Total_Students) : "0",
  } : {
    Department_Name: "",
    Establishment_Year: "",
    Department_Code: "",
    Email_ID: "",
    Department_Phone_Number: "",
    HOD_ID: "",
    Vision: "",
    Mission: "",
    Total_Faculty: "0",
    Total_Students: "0",
    Website_URL: "",
    Notable_Achievements: "",
    Industry_Collaboration: "",
    Research_Focus_Area: "",
  };

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: processedInitialData,
  });

  async function onSubmit(data: DepartmentFormValues) {
    try {
      setIsSubmitting(true);
      setSubmissionError(null);
      console.log("Form submitted with data:", data);

      // Convert string values to appropriate types
      const formattedData = {
        ...data,
        Total_Faculty: parseInt(data.Total_Faculty || "0"),
        Total_Students: parseInt(data.Total_Students || "0"),
        HOD_ID: data.HOD_ID ? parseInt(data.HOD_ID) : null,
        Establishment_Year: data.Establishment_Year || null,
      };

      if (isEditing && departmentId) {
        console.log(`Updating department ID: ${departmentId}`);
        
        // Update existing department
        const updateResponse = await fetch(`/api/departments/${departmentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });

        console.log("Update API response status:", updateResponse.status);
        
        try {
          const responseData = await updateResponse.json();
          console.log("Update API response data:", responseData);

          if (!updateResponse.ok) {
            throw new Error(responseData.message || `Failed to update department (Status: ${updateResponse.status})`);
          }

          toast.success("Department updated successfully", {
            duration: 3000,
          });
          
          // Reset form and close after successful submission
          form.reset();
          // Add a delay before closing to ensure toast is visible
          setTimeout(() => {
            onClose();
          }, 2000);
        } catch (jsonError) {
          console.error("Error parsing response JSON:", jsonError);
          throw new Error(`Failed to parse server response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
        }
      } else {
        // Create new department
        const departmentResponse = await fetch("/api/departments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Department_Name: data.Department_Name,
          }),
        });

        const departmentData = await departmentResponse.json();

        if (!departmentResponse.ok) {
          throw new Error(departmentData.message || "Failed to add department");
        }

        const departmentId = departmentData.Department_ID;

        // Now update department details
        const detailsResponse = await fetch(`/api/departments/${departmentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        });

        if (!detailsResponse.ok) {
          const errorData = await detailsResponse.json();
          throw new Error(errorData.message || "Failed to add department details");
        }

        toast.success("Department added successfully", {
          duration: 3000,
        });
        
        // Reset form and close after successful submission
        form.reset();
        // Add a delay before closing to ensure toast is visible
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving department:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save department";
      setSubmissionError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative bg-white p-6 rounded-lg shadow-lg">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Close form"
      >
        <X className="h-5 w-5 text-gray-500" />
      </button>

      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Department" : "Add New Department"}
      </h2>

      {submissionError && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-lg">
          <h3 className="text-red-600 font-medium mb-2">Error submitting form</h3>
          <p className="text-red-600">{submissionError}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <FormField
              control={form.control}
              name="Department_Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter department name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Department_Code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. CS-101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Establishment_Year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Establishment Year</FormLabel>
                  <FormControl>
                    <Input placeholder="YYYY" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="HOD_ID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Head of Department</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === "none" ? null : value)} 
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select HOD" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {facultyOptions.map((faculty) => (
                        <SelectItem key={faculty.id} value={String(faculty.id)}>
                          {faculty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Email_ID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="department@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Department_Phone_Number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter 10-digit phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Total_Faculty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Faculty</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter number of faculty" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Total_Students"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Students</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter number of students" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Website_URL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Extended Information */}
          <div className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="Vision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vision</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Department vision statement" 
                      className="resize-none h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Mission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mission</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Department mission statement" 
                      className="resize-none h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Research_Focus_Area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Research Focus Areas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Department's research focus areas" 
                      className="resize-none h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Industry_Collaboration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry Collaborations</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Department's industry collaborations" 
                      className="resize-none h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Notable_Achievements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notable Achievements</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Department's notable achievements" 
                      className="resize-none h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditing
                  ? "Updating Department..."
                  : "Adding Department..."
                : isEditing
                  ? "Update Department"
                  : "Add Department"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 