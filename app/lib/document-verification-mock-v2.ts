import { performOCRMock } from "./ocr-mock";

// Simple similarity calculation
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;

  const text1 = str1.toLowerCase().trim();
  const text2 = str2.toLowerCase().trim();

  if (text1 === text2) return 100;

  // Check if one contains the other
  if (text1.includes(text2) || text2.includes(text1)) {
    return 80;
  }

  // Simple word overlap
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);

  let commonWords = 0;
  words1.forEach((word) => {
    if (words2.includes(word) && word.length > 2) {
      commonWords++;
    }
  });

  const totalWords = Math.max(words1.length, words2.length);
  return totalWords > 0 ? (commonWords / totalWords) * 100 : 0;
}

// Date matching function
function matchDate(extractedText: string, targetDate: string): number {
  if (!targetDate) return 0;

  try {
    const date = new Date(targetDate);
    const year = date.getFullYear().toString();
    const month = date
      .toLocaleString("default", { month: "long" })
      .toLowerCase();
    const shortMonth = date
      .toLocaleString("default", { month: "short" })
      .toLowerCase();

    const textLower = extractedText.toLowerCase();

    // Check for year (most important)
    const yearMatch = textLower.includes(year);
    // Check for month name
    const monthMatch =
      textLower.includes(month) || textLower.includes(shortMonth);

    let score = 0;
    if (yearMatch) score += 70; // Year is most important
    if (monthMatch) score += 30; // Month adds confidence

    return score;
  } catch {
    return 0;
  }
}

// Mock document verification service with correct structure
export async function verifyAwardDocument(
  buffer: Buffer,
  formData?: any
): Promise<{
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
}> {
  try {
    console.log("Mock verification - Processing award document...", formData);
    const extractedText = await performOCRMock(buffer);

    // Default mock matches for when no form data is provided
    let organizationMatch = 20; // Low default
    let nameMatch = 15;
    let dateMatch = 10;
    let matchedTerms: string[] = [];
    let warnings: string[] = [];

    if (formData) {
      // Check organization match
      if (formData.awarding_organization) {
        organizationMatch = calculateSimilarity(
          extractedText,
          formData.awarding_organization
        );
        if (organizationMatch > 60) {
          matchedTerms.push(`Organization: ${formData.awarding_organization}`);
        } else if (organizationMatch < 40) {
          warnings.push(
            `Organization "${formData.awarding_organization}" not clearly found in certificate`
          );
        }
      }

      // Check award name match
      if (formData.award_title || formData.award_name) {
        const awardName = formData.award_title || formData.award_name;
        nameMatch = calculateSimilarity(extractedText, awardName);
        if (nameMatch > 60) {
          matchedTerms.push(`Award: ${awardName}`);
        } else if (nameMatch < 40) {
          warnings.push(
            `Award name "${awardName}" not clearly found in certificate`
          );
        }
      }

      // Check date match
      if (formData.award_date) {
        dateMatch = matchDate(extractedText, formData.award_date);
        if (dateMatch > 50) {
          matchedTerms.push(`Date: ${formData.award_date}`);
        } else {
          warnings.push(
            `Award date "${formData.award_date}" not found in certificate text`
          );
        }
      }
    }

    // Calculate overall score with weights
    const overallMatch =
      organizationMatch * 0.4 + nameMatch * 0.35 + dateMatch * 0.25;

    // Determine if valid (threshold of 50%)
    const isValid = overallMatch >= 50;

    // Add additional warnings for low scores
    if (overallMatch < 30) {
      warnings.push(
        "Very low confidence - certificate content may not match provided information"
      );
    }

    return {
      isValid,
      confidence: Math.round(overallMatch),
      score: Math.round(overallMatch),
      details: {
        textExtracted: true,
        organizationMatch: Math.round(organizationMatch),
        nameMatch: Math.round(nameMatch),
        dateMatch: Math.round(dateMatch),
        overallMatch: Math.round(overallMatch),
        extractedText,
        matchedTerms,
        suggestions: isValid
          ? []
          : [
              "Verify that the certificate matches the award details provided",
              "Check if organization name is spelled correctly",
              "Ensure the award date is accurate",
            ],
      },
      warnings,
      errors: [],
    };
  } catch (error) {
    console.error("Mock verification error:", error);
    return {
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
        "Verification failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      ],
    };
  }
}

export async function verifyMembershipDocument(
  buffer: Buffer,
  formData?: any
): Promise<{
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
}> {
  try {
    console.log(
      "Mock verification - Processing membership document...",
      formData
    );
    const extractedText = await performOCRMock(buffer);

    // Default mock matches for when no form data is provided
    let organizationMatch = 20;
    let nameMatch = 15;
    let dateMatch = 10;
    let identifierMatch = 0;
    let matchedTerms: string[] = [];
    let warnings: string[] = [];

    if (formData) {
      // Check organization match
      if (formData.organization) {
        organizationMatch = calculateSimilarity(
          extractedText,
          formData.organization
        );
        if (organizationMatch > 60) {
          matchedTerms.push(`Organization: ${formData.organization}`);
        } else if (organizationMatch < 40) {
          warnings.push(
            `Organization "${formData.organization}" not clearly found in certificate`
          );
        }
      }

      // Check membership type match
      if (formData.membership_type) {
        nameMatch = calculateSimilarity(
          extractedText,
          formData.membership_type
        );
        if (nameMatch > 60) {
          matchedTerms.push(`Type: ${formData.membership_type}`);
        }
      }

      // Check membership ID match
      if (formData.membership_id) {
        identifierMatch = calculateSimilarity(
          extractedText,
          formData.membership_id
        );
        if (identifierMatch > 60) {
          matchedTerms.push(`ID: ${formData.membership_id}`);
        } else {
          warnings.push(
            `Membership ID "${formData.membership_id}" not found in certificate`
          );
        }
      }

      // Check date match
      if (formData.start_date) {
        dateMatch = matchDate(extractedText, formData.start_date);
        if (dateMatch > 50) {
          matchedTerms.push(`Date: ${formData.start_date}`);
        } else {
          warnings.push(
            `Start date "${formData.start_date}" not found in certificate text`
          );
        }
      }
    }

    // Calculate overall score with weights
    const overallMatch =
      organizationMatch * 0.35 +
      nameMatch * 0.25 +
      identifierMatch * 0.25 +
      dateMatch * 0.15;

    // Determine if valid (threshold of 50%)
    const isValid = overallMatch >= 50;

    if (overallMatch < 30) {
      warnings.push(
        "Very low confidence - certificate content may not match provided information"
      );
    }

    return {
      isValid,
      confidence: Math.round(overallMatch),
      score: Math.round(overallMatch),
      details: {
        textExtracted: true,
        organizationMatch: Math.round(organizationMatch),
        nameMatch: Math.round(nameMatch),
        dateMatch: Math.round(dateMatch),
        identifierMatch: Math.round(identifierMatch),
        overallMatch: Math.round(overallMatch),
        extractedText,
        matchedTerms,
        suggestions: isValid
          ? []
          : [
              "Verify that the certificate matches the membership details provided",
              "Check if organization name is spelled correctly",
              "Ensure the membership ID and dates are accurate",
            ],
      },
      warnings,
      errors: [],
    };
  } catch (error) {
    console.error("Mock verification error:", error);
    return {
      isValid: false,
      confidence: 0,
      score: 0,
      details: {
        textExtracted: false,
        organizationMatch: 0,
        nameMatch: 0,
        dateMatch: 0,
        identifierMatch: 0,
        overallMatch: 0,
        extractedText: "",
        matchedTerms: [],
        suggestions: [],
      },
      warnings: [],
      errors: [
        "Verification failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      ],
    };
  }
}
