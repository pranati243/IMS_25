"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Loader2,
  Shield,
} from "lucide-react";

interface VerificationResult {
  isValid: boolean;
  confidence: number;
  score: number;
  details: {
    textExtracted: boolean;
    organizationMatch: number;
    nameMatch: number;
    dateMatch: number;
    identifierMatch?: number;
    overallMatch: number;
    extractedText: string;
    matchedTerms: string[];
    suggestions?: string[];
  };
  warnings: string[];
  errors: string[];
}

interface DocumentVerificationProps {
  file: File | null;
  verificationData: any;
  verificationType: "award" | "membership";
  onVerificationComplete: (result: VerificationResult) => void;
  disabled?: boolean;
}

export function DocumentVerification({
  file,
  verificationData,
  verificationType,
  onVerificationComplete,
  disabled = false,
}: DocumentVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleVerification = async () => {
    if (!file || !verificationData) {
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const formData = new FormData();
      formData.append("certificate", file);
      formData.append("type", verificationType);
      formData.append("data", JSON.stringify(verificationData));

      const response = await fetch("/api/verify-document", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setVerificationResult(result.verification);
        onVerificationComplete(result.verification);
      } else {
        throw new Error(result.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      const errorResult: VerificationResult = {
        isValid: false,
        confidence: 0,
        score: 0,
        details: {
          textExtracted: false,
          organizationMatch: 0,
          nameMatch: 0,
          dateMatch: 0,
          overallMatch: 0,
          extractedText: "",
          matchedTerms: [],
          suggestions: [],
        },
        warnings: [],
        errors: [
          error instanceof Error ? error.message : "Verification failed",
        ],
      };
      setVerificationResult(errorResult);
      onVerificationComplete(errorResult);
    } finally {
      setIsVerifying(false);
    }
  };

  const getVerificationIcon = () => {
    if (!verificationResult) return null;

    if (verificationResult.errors.length > 0) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else if (verificationResult.isValid) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getVerificationColor = () => {
    if (!verificationResult) return "gray";

    if (verificationResult.errors.length > 0) return "red";
    if (verificationResult.isValid) return "green";
    return "yellow";
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-base">Certificate Verification</CardTitle>
        </div>
        {verificationResult && (
          <Badge
            variant={getVerificationColor() as any}
            className="flex items-center space-x-1"
          >
            {getVerificationIcon()}
            <span className="ml-1">
              {verificationResult.errors.length > 0
                ? "Failed"
                : verificationResult.isValid
                ? "Verified"
                : "Needs Review"}
            </span>
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {!file ? (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Please upload a certificate file to enable verification.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                File: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
              <Button
                type="button"
                onClick={handleVerification}
                disabled={isVerifying || disabled}
                size="sm"
                variant="outline"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Certificate
                  </>
                )}
              </Button>
            </div>

            {verificationResult && (
              <div className="space-y-4">
                {/* Overall Score */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Verification Score
                    </span>
                    <span
                      className={`text-sm font-bold ${getScoreColor(
                        verificationResult.score
                      )}`}
                    >
                      {verificationResult.score.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={verificationResult.score} className="h-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Confidence</span>
                    <span className="text-xs text-gray-600">
                      {verificationResult.confidence.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Quick Results */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Organization:</span>
                    <span
                      className={getScoreColor(
                        verificationResult.details.organizationMatch
                      )}
                    >
                      {verificationResult.details.organizationMatch.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date Match:</span>
                    <span
                      className={getScoreColor(
                        verificationResult.details.dateMatch
                      )}
                    >
                      {verificationResult.details.dateMatch.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      {verificationType === "award"
                        ? "Award Name:"
                        : "Membership Type:"}
                    </span>
                    <span
                      className={getScoreColor(
                        verificationResult.details.nameMatch
                      )}
                    >
                      {verificationResult.details.nameMatch.toFixed(0)}%
                    </span>
                  </div>
                  {verificationType === "membership" &&
                    verificationResult.details.identifierMatch !==
                      undefined && (
                      <div className="flex justify-between">
                        <span>Member ID:</span>
                        <span
                          className={getScoreColor(
                            verificationResult.details.identifierMatch * 100
                          )}
                        >
                          {(
                            verificationResult.details.identifierMatch * 100
                          ).toFixed(0)}
                          %
                        </span>
                      </div>
                    )}
                </div>

                {/* Warnings */}
                {verificationResult.warnings.length > 0 && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <div className="space-y-1">
                        {verificationResult.warnings.map((warning, index) => (
                          <div key={index} className="text-xs">
                            • {warning}
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Errors */}
                {verificationResult.errors.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <div className="space-y-1">
                        {verificationResult.errors.map((error, index) => (
                          <div key={index} className="text-xs">
                            • {error}
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Suggestions */}
                {verificationResult.details.suggestions &&
                  verificationResult.details.suggestions.length > 0 && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <div className="text-xs font-medium mb-1">
                          Suggestions:
                        </div>
                        <div className="space-y-1">
                          {verificationResult.details.suggestions.map(
                            (suggestion, index) => (
                              <div key={index} className="text-xs">
                                • {suggestion}
                              </div>
                            )
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                {/* Detailed Results */}
                <div className="border-t pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs"
                  >
                    {showDetails ? "Hide" : "Show"} Detailed Results
                  </Button>

                  {showDetails && (
                    <div className="mt-3 space-y-3 text-xs">
                      {verificationResult.details.matchedTerms.length > 0 && (
                        <div>
                          <div className="font-medium mb-1">Matched Terms:</div>
                          <div className="space-y-1">
                            {verificationResult.details.matchedTerms.map(
                              (term, index) => (
                                <div key={index} className="text-gray-600">
                                  • {term}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {verificationResult.details.extractedText && (
                        <div>
                          <div className="font-medium mb-1">
                            Extracted Text Preview:
                          </div>
                          <div className="bg-gray-50 p-2 rounded text-xs max-h-32 overflow-y-auto">
                            {verificationResult.details.extractedText.substring(
                              0,
                              500
                            )}
                            {verificationResult.details.extractedText.length >
                              500 && "..."}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default DocumentVerification;
