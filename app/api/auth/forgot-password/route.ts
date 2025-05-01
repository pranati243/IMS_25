import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { query } from "@/app/lib/db";
import { sendEmail, generatePasswordResetEmail } from "@/app/lib/email";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const users = await query(
      `SELECT id, email, username FROM users WHERE email = ? AND is_active = 1 LIMIT 1`,
      [email]
    ) as Array<{ id: number, email: string, username: string }>;

    // For security reasons, always return success even if email doesn't exist
    // This prevents email enumeration attacks
    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "If your email exists in our system, you will receive a password reset link shortly.",
      });
    }

    const user = users[0];

    // Generate a reset token
    const token = randomBytes(32).toString("hex");
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // Token valid for 1 hour
    
    // Format expiry date for MySQL
    const formattedExpiryDate = expiryDate.toISOString().slice(0, 19).replace('T', ' ');

    try {
      // First check if the password_reset_tokens table exists
      const tablesResult = await query(
        `
        SELECT 
          COUNT(*) as table_exists 
        FROM 
          information_schema.tables 
        WHERE 
          table_schema = DATABASE() 
          AND table_name = 'password_reset_tokens'
        `
      ) as Array<{ table_exists: number }>;

      const tableExists = tablesResult[0].table_exists > 0;

      if (!tableExists) {
        // Create the password_reset_tokens table
        await query(`
          CREATE TABLE password_reset_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            used TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
          )
        `);
      }

      // Store token in database
      await query(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
        [user.id, token, formattedExpiryDate]
      );

      // Generate the reset URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;
      
      // Generate and send the email
      const emailOptions = generatePasswordResetEmail(user.email, resetUrl);
      const emailSent = await sendEmail(emailOptions);

      // Log the reset link in development environment
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Reset link: ${resetUrl}`);
      }

      // Return success response
      return NextResponse.json({
        success: true,
        message: "If your email exists in our system, you will receive a password reset link shortly.",
        // In development, return the token for testing
        ...(process.env.NODE_ENV !== 'production' && { resetUrl }),
      });
    } catch (error) {
      console.error("Database or email error:", error);
      return NextResponse.json({
        success: false,
        message: "An error occurred while processing your request.",
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to process request",
    });
  }
} 