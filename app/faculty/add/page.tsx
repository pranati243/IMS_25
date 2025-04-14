"use client";

import { useRouter } from "next/navigation";
import { AddFacultyForm } from "@/components/faculty/AddFacultyForm";
import { Card } from "@/components/ui/card";

export default function AddFacultyPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/faculty"); // Navigate back to faculty list
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <AddFacultyForm onClose={handleClose} />
      </div>
    </div>
  );
} 