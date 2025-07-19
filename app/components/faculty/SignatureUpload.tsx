"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, X, Save, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/app/providers/auth-provider";

interface SignatureUploadProps {
  onSignatureUpdate?: (signatureUrl: string) => void;
}

export function SignatureUpload({ onSignatureUpdate }: SignatureUploadProps) {
  const { user } = useAuth();
  const [currentSignature, setCurrentSignature] = useState<string>("");
  const [previewSignature, setPreviewSignature] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size should be less than 2MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewSignature(result);
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  // Upload signature
  const handleUpload = async () => {
    if (!previewSignature) {
      alert("Please select a signature image first");
      return;
    }

    try {
      setIsUploading(true);

      // Convert base64 to blob
      const response = await fetch(previewSignature);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append("signature", blob, "signature.png");
      formData.append("userId", user?.id?.toString() || "");

      // Upload to server
      const uploadResponse = await fetch("/api/faculty/signature", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload signature");
      }

      const result = await uploadResponse.json();

      if (result.success) {
        setCurrentSignature(result.signatureUrl);
        setPreviewSignature("");

        // Notify parent component
        if (onSignatureUpdate) {
          onSignatureUpdate(result.signatureUrl);
        }

        alert("Signature uploaded successfully!");
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading signature:", error);
      alert("Failed to upload signature. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Remove signature
  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove your signature?")) {
      return;
    }

    try {
      setIsUploading(true);

      const response = await fetch("/api/faculty/signature", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove signature");
      }

      const result = await response.json();

      if (result.success) {
        setCurrentSignature("");
        setPreviewSignature("");

        // Notify parent component
        if (onSignatureUpdate) {
          onSignatureUpdate("");
        }

        alert("Signature removed successfully!");
      } else {
        throw new Error(result.message || "Remove failed");
      }
    } catch (error) {
      console.error("Error removing signature:", error);
      alert("Failed to remove signature. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Digital Signature
        </CardTitle>
        <CardDescription>
          Upload your digital signature for reports and official documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current signature display */}
        {currentSignature && !previewSignature && (
          <div className="space-y-2">
            <Label>Current Signature</Label>
            <div className="border rounded-lg p-4 bg-gray-50">
              <Image
                src={currentSignature}
                alt="Current signature"
                width={200}
                height={80}
                className="max-h-20 object-contain"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          </div>
        )}

        {/* Upload area */}
        <div className="space-y-2">
          <Label>
            {currentSignature ? "Update Signature" : "Upload Signature"}
          </Label>

          {/* Preview */}
          {previewSignature && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">Preview:</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewSignature("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Image
                src={previewSignature}
                alt="Signature preview"
                width={200}
                height={80}
                className="max-h-20 object-contain"
              />
            </div>
          )}

          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-1">
              Drag and drop your signature image here, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supports: JPG, PNG, GIF (Max 2MB)
            </p>

            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Upload button */}
          {previewSignature && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full flex items-center gap-2"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isUploading ? "Uploading..." : "Save Signature"}
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p>• Signature should be on white background</p>
          <p>• Keep the signature clear and professional</p>
          <p>• Recommended dimensions: 200x80 pixels</p>
        </div>
      </CardContent>
    </Card>
  );
}
