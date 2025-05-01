"use client";

import { useState } from "react";
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
import { CustomDatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import { format } from "date-fns";

// Form validation schema
const facultyFormSchema = z.object({
  // Faculty table fields
  F_name: z.string().min(2, "Name must be at least 2 characters"),
  F_dept: z.string().min(1, "Department is required"),

  // Faculty details fields
  Email: z.string().email("Invalid email address"),
  Phone_Number: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
  PAN_Number: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number"),
  Aadhaar_Number: z.string().regex(/^[0-9]{12}$/, "Aadhaar number must be 12 digits"),
  Highest_Degree: z.string().min(1, "Highest degree is required"),
  Area_of_Certification: z.string().optional(),
  Date_of_Joining: z.date(),
  Experience: z.number().min(0, "Experience cannot be negative"),
  Past_Experience: z.string().optional(),
  Age: z.number().min(18, "Age must be at least 18"),
  Current_Designation: z.string().min(1, "Current designation is required"),
  Date_of_Birth: z.date(),
  Nature_of_Association: z.string().min(1, "Nature of association is required"),
});

type FacultyFormValues = z.infer<typeof facultyFormSchema>;

const departments = [
  "Computer Engineering",
  "Mechanical Engineering",
  "Electronics and Telecommunication Engineering",
  "Electrical Engineering",
  "Information Technology",
];

interface AddFacultyFormProps {
  onClose: () => void;
  initialData?: any;
  isEditing?: boolean;
  facultyId?: number;
}

export function AddFacultyForm({ 
  onClose, 
  initialData, 
  isEditing = false,
  facultyId 
}: AddFacultyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const form = useForm<FacultyFormValues>({
    resolver: zodResolver(facultyFormSchema),
    defaultValues: initialData || {
      F_name: "",
      F_dept: "",
      Email: "",
      Phone_Number: "",
      PAN_Number: "",
      Aadhaar_Number: "",
      Highest_Degree: "",
      Area_of_Certification: "",
      Experience: 0,
      Past_Experience: "",
      Age: 18,
      Current_Designation: "",
      Nature_of_Association: "",
    },
  });

  async function onSubmit(data: FacultyFormValues) {
    try {
      setIsSubmitting(true);
      setSubmissionError(null);
      console.log("Form submitted with data:", data);

      if (isEditing && facultyId) {
        console.log(`Updating faculty ID: ${facultyId}`);
        
        // Prepare request body with proper date formatting
        const requestBody = {
          ...data,
          Date_of_Joining: data.Date_of_Joining ? format(data.Date_of_Joining, 'yyyy-MM-dd') : null,
          Date_of_Birth: data.Date_of_Birth ? format(data.Date_of_Birth, 'yyyy-MM-dd') : null,
        };
        
        console.log("Sending PUT request with body:", requestBody);
        console.log("To URL:", `/api/faculty/${facultyId}`);
        
        // Update existing faculty
        const updateResponse = await fetch(`/api/faculty/${facultyId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        console.log("Update API response status:", updateResponse.status);
        console.log("Update API response headers:", Object.fromEntries([...updateResponse.headers.entries()]));
        
        // Clone the response before consuming it
        const clonedResponse = updateResponse.clone();
        
        try {
          const responseData = await updateResponse.json();
          console.log("Update API response data:", responseData);

          if (!updateResponse.ok) {
            throw new Error(responseData.message || `Failed to update faculty (Status: ${updateResponse.status})`);
          }

          toast.success("Faculty updated successfully", {
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
          
          // Try to read response as text instead
          const textResponse = await clonedResponse.text();
          console.error("Response text:", textResponse);
          
          throw new Error(`Failed to parse server response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
        }
      } else {
        // Create new faculty
        const facultyResponse = await fetch("/api/faculty", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            F_name: data.F_name,
            F_dept: data.F_dept,
          }),
        });

        const facultyData = await facultyResponse.json();

        if (!facultyResponse.ok) {
          throw new Error(facultyData.message || "Failed to add faculty");
        }

        const F_id = facultyData.F_id;

        const detailsResponse = await fetch("/api/faculty/details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            F_ID: F_id,
            ...data,
            Date_of_Joining: data.Date_of_Joining ? format(data.Date_of_Joining, 'yyyy-MM-dd') : null,
            Date_of_Birth: data.Date_of_Birth ? format(data.Date_of_Birth, 'yyyy-MM-dd') : null,
          }),
        });

        if (!detailsResponse.ok) {
          const errorData = await detailsResponse.json();
          throw new Error(errorData.message || "Failed to add faculty details");
        }

        toast.success("Faculty added successfully", {
          duration: 3000,
        });
      }

    } catch (error) {
      console.error("Error saving faculty:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save faculty";
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
        {isEditing ? "Edit Faculty" : "Add New Faculty"}
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
              name="F_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="F_dept"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
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
              name="Email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Phone_Number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="PAN_Number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter PAN number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Aadhaar_Number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aadhaar Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Aadhaar number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Highest_Degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Highest Degree</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter highest degree" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Area_of_Certification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area of Certification</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter area of certification" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Date_of_Joining"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Joining</FormLabel>
                  <FormControl>
                    <CustomDatePicker
                      date={field.value || undefined}
                      setDate={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience (Years)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter years of experience"
                      {...field}
                      value={field.value?.toString() || "0"}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter age"
                      {...field}
                      value={field.value?.toString() || "18"}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 18)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Current_Designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter current designation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Date_of_Birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <CustomDatePicker
                      date={field.value || undefined}
                      setDate={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Nature_of_Association"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nature of Association</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter nature of association" {...field} />
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
                  ? "Updating Faculty..."
                  : "Adding Faculty..."
                : isEditing
                  ? "Update Faculty"
                  : "Add Faculty"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 