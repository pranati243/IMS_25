import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { query } from "@/app/lib/db";
import { sendEmail, generatePasswordResetEmail } from "@/app/lib/email";

// Regular expression for validating email format
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    // Get hostname from the request to determine the correct base URL
    const host = request.headers.get('host') || 'localhost:3001';
    // Use appropriate protocol based on environment and host
    let protocol = 'http';
    //if (process.env.NODE_ENV === 'production') {
    //  protocol = 'https';
    //}
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    
    console.log('Email Config in forgot-password route:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('SMTP_HOST:', process.env.SMTP_HOST || 'not set');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || 'not set');
    console.log('SMTP_USER exists:', !!process.env.SMTP_USER);
    console.log('SMTP_PASSWORD exists:', !!process.env.SMTP_PASSWORD);
    console.log('SMTP_FROM_EMAIL:', process.env.SMTP_FROM_EMAIL || 'not set');
    console.log('Base URL for reset link:', baseUrl);
    console.log('------------------------');

    // Validate input
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      console.log(`Invalid email format: ${email}`);
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
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
      console.log(`User with email ${email} not found`);
      return NextResponse.json({
        success: true,
        message: "If your email exists in our system, you will receive a password reset link shortly.",
      });
    }

    const user = users[0];
    console.log(`User found: ${user.username} (${user.email})`);

    // Generate a reset token
    const token = randomBytes(32).toString("hex");
    
    // Set expiry date to 24 hours in the future instead of just 1 hour
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24); // Token valid for 24 hours
    
    // Format expiry date for MySQL
    const formattedExpiryDate = expiryDate.toISOString().slice(0, 19).replace('T', ' ');
    
    console.log(`Generated token: ${token.substring(0, 10)}...`);
    console.log(`Token expiry: ${formattedExpiryDate} (${expiryDate.toISOString()})`);

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
      console.log(`password_reset_tokens table exists: ${tableExists}`);

      if (!tableExists) {
        // Create the password_reset_tokens table
        console.log('Creating password_reset_tokens table...');
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
        console.log('Table created successfully');
      }

      // Invalidate any existing unused tokens for this user
      await query(
        `UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0`,
        [user.id]
      );
      console.log(`Invalidated existing tokens for user ${user.id}`);

      // Store token in database
      console.log(`Storing token for user ${user.id}`);
      const insertResult = await query(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
        [user.id, token, formattedExpiryDate]
      );
      console.log('Token stored with ID:', (insertResult as any).insertId);

      // Generate the reset URL
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;
      console.log(`Reset URL generated: ${resetUrl}`);
      
      // Generate and send the email
      console.log(`Generating email for ${user.email}`);
      const emailOptions = generatePasswordResetEmail(user.email, resetUrl);
      
      console.log('Attempting to send email...');
      let emailSent = false;
      let emailError = null;
      
      try {
        emailSent = await sendEmail(emailOptions);
        console.log(`Email send result: ${emailSent ? 'Success' : 'Failed'}`);
      } catch (err) {
        emailError = err;
        console.error('Error sending email:', err);
      }

      // Always log the reset link for debugging
      console.log(`Reset link: ${resetUrl}`);

      // Return appropriate response
      if (!emailSent) {
        // In development, return detailed error for debugging
        if (process.env.NODE_ENV !== 'production') {
          return NextResponse.json({
            success: false,
            message: "Failed to send password reset email. Please contact support.",
            debug: {
              resetUrl,
              error: emailError ? (emailError instanceof Error ? emailError.message : String(emailError)) : 'Unknown error'
            }
          });
        } else {
          // In production, return generic error
          return NextResponse.json({
            success: false,
            message: "Failed to send password reset email. Please try again later or contact support."
          });
        }
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
        ...(process.env.NODE_ENV !== 'production' && { 
          error: error instanceof Error ? error.message : String(error) 
        }),
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to process request",
      ...(process.env.NODE_ENV !== 'production' && { 
        error: error instanceof Error ? error.message : String(error) 
      }),
    });
  }
} 