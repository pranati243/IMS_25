/**
 * DOI (Digital Object Identifier) utility functions
 * Used for retrieving metadata from DOIs for publication entries
 */

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
  citationCount?: number;
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
      doi: cleanDoi,
      citationCount: metadata["is-referenced-by-count"] || undefined,
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
