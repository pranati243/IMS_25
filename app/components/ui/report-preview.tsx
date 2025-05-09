"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Printer, X } from "lucide-react";

interface ReportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBase64?: string;
  filename?: string;
  title: string;
}

export function ReportPreview({
  isOpen,
  onClose,
  pdfBase64,
  filename,
  title,
}: ReportPreviewProps) {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const handleDownload = () => {
    if (!pdfBase64 || !filename) return;

    try {
      setDownloading(true);
      // Create a data URL from the base64 PDF
      const pdfDataUri = `data:application/pdf;base64,${pdfBase64}`;

      // Create an invisible link and trigger download
      const link = document.createElement("a");
      link.href = pdfDataUri;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!pdfBase64) return;

    try {
      setPrinting(true);
      // Create a data URL from the base64 PDF
      const pdfDataUri = `data:application/pdf;base64,${pdfBase64}`;

      // Open the PDF in a new tab for printing
      const printWindow = window.open(pdfDataUri);

      // Trigger print dialog
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          setPrinting(false);
        };
      } else {
        setPrinting(false);
      }
    } catch (error) {
      console.error("Error printing PDF:", error);
      setPrinting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[calc(100vh-80px)] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex justify-between items-center">
            <span>{title}</span>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-grow flex-1 overflow-hidden">
          {pdfBase64 ? (
            <iframe
              src={`data:application/pdf;base64,${pdfBase64}`}
              className="w-full h-full border rounded-md"
              title="PDF Report Preview"
            />
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <div className="flex justify-between w-full">
            <div>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrint}
                disabled={!pdfBase64 || printing}
                className="flex items-center gap-2"
              >
                {printing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4" />
                )}
                Print
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!pdfBase64 || downloading}
                className="flex items-center gap-2"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
