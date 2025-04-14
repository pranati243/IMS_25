"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
// import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";

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

export function AddFacultyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FacultyFormValues>({
    resolver: zodResolver(facultyFormSchema),
    defaultValues: {
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
      Age: 0,
      Current_Designation: "",
      Nature_of_Association: "",
    },
  });

  async function onSubmit(data: FacultyFormValues) {
    try {
      setIsSubmitting(true);

      // First insert into faculty table
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

      if (!facultyResponse.ok) {
        throw new Error("Failed to add faculty");
      }

      const facultyData = await facultyResponse.json();
      const F_id = facultyData.F_id;

      // Then insert into faculty_details table
      const detailsResponse = await fetch("/api/faculty/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          F_ID: F_id,
          ...data,
        }),
      });

      if (!detailsResponse.ok) {
        throw new Error("Failed to add faculty details");
      }

      toast.success("Faculty added successfully");
      form.reset();
    } catch (error) {
      console.error("Error adding faculty:", error);
      toast.error("Failed to add faculty");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
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
            render={({ field }: { field: any }) => (
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
            render={({ field }: { field: any }) => (
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
                  <DatePicker
                    date={field.value}
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
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                  <DatePicker
                    date={field.value}
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding Faculty..." : "Add Faculty"}
        </Button>
      </form>
    </Form>
  );
} 