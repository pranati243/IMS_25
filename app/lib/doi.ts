/**
 * DOI (Digital Object Identifier) utility functions
 * Used for retrieving metadata from DOIs for publication entries
 */

/**
 * Interface for citation data from different sources
 */
export interface CitationData {
  crossref?: number;
  semanticScholar?: number; // Free alternative to Google Scholar
  googleScholar?: number; // Requires scraping or unofficial APIs
  webOfScience?: number; // Requires institutional access
  scopus?: number; // Requires API key
}

/**
 * Interface for publication metadata from a DOI
 */
export interface DoiMetadata {
  title: string;
  authors: string;
  abstract?: string;
  publicationDate?: string;
  publicationType?:
    | "journal"
    | "conference"
    | "book"
    | "book_chapter"
    | "other";
  publicationVenue?: string;
  url?: string;
  citationCount?: number; // Keep for backward compatibility
  citations?: CitationData; // New structured citation data
  doi: string;
}

/**
 * Retrieves metadata for a publication from a DOI
 * Uses the Crossref API (https://api.crossref.org/)
 *
 * @param doi The Digital Object Identifier to lookup
 * @returns Publication metadata or error message
 */
export async function getDoiMetadata(doi: string): Promise<{
  success: boolean;
  data?: DoiMetadata;
  message?: string;
}> {
  try {
    // Validate DOI format
    const doiPattern = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;
    const cleanDoi = doi.trim();

    if (!doiPattern.test(cleanDoi)) {
      return {
        success: false,
        message:
          'Invalid DOI format. DOIs typically start with "10." followed by a numeric prefix and suffix.',
      };
    }

    // Call the Crossref API with the DOI
    const response = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to fetch DOI data: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (!data.message) {
      return {
        success: false,
        message: "Invalid response from the DOI service",
      };
    }

    // Extract and format the relevant metadata
    const metadata = data.message;

    // Format authors
    let authors = "";
    if (
      metadata.author &&
      Array.isArray(metadata.author) &&
      metadata.author.length > 0
    ) {
      authors = metadata.author
        .map((author: any) => {
          const family = author.family || "";
          const given = author.given || "";
          return family && given
            ? `${family}, ${given.charAt(0)}.`
            : family || given;
        })
        .join(", ");
    }

    // Determine publication type
    let publicationType: DoiMetadata["publicationType"] = "other";
    if (metadata.type) {
      const type = metadata.type.toLowerCase();
      if (type.includes("journal") || type === "journal-article") {
        publicationType = "journal";
      } else if (type.includes("conference") || type.includes("proceedings")) {
        publicationType = "conference";
      } else if (type === "book") {
        publicationType = "book";
      } else if (type === "book-chapter") {
        publicationType = "book_chapter";
      }
    }

    // Extract publication date
    let publicationDate = "";
    if (
      metadata["published-print"] &&
      metadata["published-print"]["date-parts"] &&
      Array.isArray(metadata["published-print"]["date-parts"][0])
    ) {
      const parts = metadata["published-print"]["date-parts"][0];
      const year = parts[0];
      const month =
        parts.length > 1 ? parts[1].toString().padStart(2, "0") : "01";
      const day =
        parts.length > 2 ? parts[2].toString().padStart(2, "0") : "01";
      publicationDate = `${year}-${month}-${day}`;
    } else if (
      metadata.created &&
      metadata.created["date-parts"] &&
      Array.isArray(metadata.created["date-parts"][0])
    ) {
      const parts = metadata.created["date-parts"][0];
      const year = parts[0];
      const month =
        parts.length > 1 ? parts[1].toString().padStart(2, "0") : "01";
      const day =
        parts.length > 2 ? parts[2].toString().padStart(2, "0") : "01";
      publicationDate = `${year}-${month}-${day}`;
    }

    // Extract publication venue
    let publicationVenue = "";
    if (
      metadata["container-title"] &&
      Array.isArray(metadata["container-title"]) &&
      metadata["container-title"].length > 0
    ) {
      publicationVenue = metadata["container-title"][0];
    } else if (metadata["publisher"]) {
      publicationVenue = metadata["publisher"];
    }

    // Return formatted metadata
    const formattedMetadata: DoiMetadata = {
      title:
        metadata.title && Array.isArray(metadata.title)
          ? metadata.title[0]
          : "",
      authors,
      abstract: metadata.abstract || undefined,
      publicationDate: publicationDate || undefined,
      publicationType,
      publicationVenue: publicationVenue || undefined,
      url: metadata.URL || undefined,
      citationCount: metadata["is-referenced-by-count"] || undefined, // Backward compatibility
      citations: {
        crossref: metadata["is-referenced-by-count"] || undefined,
        // Note: Google Scholar and Web of Science require separate API calls
        // These would need additional API integrations with proper authentication
      },
      doi: cleanDoi,
    };

    return {
      success: true,
      data: formattedMetadata,
    };
  } catch (error) {
    console.error("Error fetching DOI metadata:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to retrieve DOI metadata",
    };
  }
}

/**
 * Fetch citation count from Semantic Scholar (free alternative to Google Scholar API)
 * @param doi The DOI to lookup
 * @returns Citation count from Semantic Scholar or undefined
 */
async function getSemanticScholarCitations(
  doi: string
): Promise<number | undefined> {
  try {
    const response = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/DOI:${encodeURIComponent(
        doi
      )}?fields=citationCount`,
      {
        headers: {
          "User-Agent": "IMS-Faculty-System",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.citationCount || undefined;
    }
  } catch (error) {
    console.warn("Failed to fetch Semantic Scholar citations:", error);
  }
  return undefined;
}

/**
 * Mock function for Web of Science citations
 * Note: Web of Science API requires institutional access and authentication
 * @param doi The DOI to lookup
 * @returns Placeholder citation count
 */
async function getWebOfScienceCitations(
  doi: string
): Promise<number | undefined> {
  // This is a mock implementation
  // In a real scenario, you would need:
  // 1. Web of Science API credentials
  // 2. Institutional access
  // 3. Proper authentication headers

  console.log(
    "Web of Science API integration would require institutional access"
  );
  return undefined;
}

/**
 * Enhanced DOI metadata retrieval with multiple citation sources
 * @param doi The Digital Object Identifier to lookup
 * @returns Publication metadata with citations from multiple sources
 */
export async function getEnhancedDoiMetadata(doi: string): Promise<{
  success: boolean;
  data?: DoiMetadata;
  message?: string;
}> {
  try {
    // First get basic metadata from Crossref
    const basicResult = await getDoiMetadata(doi);
    if (!basicResult.success || !basicResult.data) {
      return basicResult;
    }

    // Enhance with additional citation sources
    const enhancedData = { ...basicResult.data };

    // Add Semantic Scholar citations (free alternative to Google Scholar)
    const semanticScholarCitations = await getSemanticScholarCitations(doi);

    // Enhanced citations object
    enhancedData.citations = {
      crossref: enhancedData.citationCount,
      semanticScholar: semanticScholarCitations,
      // webOfScience: await getWebOfScienceCitations(doi), // Requires institutional access
    };

    return {
      success: true,
      data: enhancedData,
    };
  } catch (error) {
    console.error("Error fetching enhanced DOI metadata:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to retrieve enhanced DOI metadata",
    };
  }
}
