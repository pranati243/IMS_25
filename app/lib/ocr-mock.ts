// Mock OCR service for development/testing
export async function performOCRMock(buffer: Buffer): Promise<string> {
  // For development purposes, return a mock OCR result
  // In a real implementation, you would replace this with actual OCR
  console.log("Mock OCR called with buffer size:", buffer.length);

  // Return a realistic mock OCR result for an internship certificate
  return `
    INTERNSHIP COMPLETION CERTIFICATE
    This is to certify that
    ARJUN PRAVEEN VARSHNEY
    has successfully completed
    Software Development Internship
    at ABC Technologies Pvt. Ltd.
    Duration: 6 months
    From: July 2024 to December 2024
    Date of Issue: 15th December 2024
    Certificate ID: INTERN-2024-789
    
    Authorized Signatory
    HR Department
    ABC Technologies
  `;
}
