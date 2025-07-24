import { NextRequest, NextResponse } from "next/server";
import { sendEmail, generatePasswordResetEmail } from "@/app/lib/email";

export async function GET(request: NextRequest) {
  // Don't allow in production
  //if (process.env.NODE_ENV === 'production') {
    //return NextResponse.json({
      //success: false,
      //message: "This endpoint is not available in production",
    //}, { status: 403 });
  //}

  try {
    // Get hostname from the request to determine the correct base URL
    const host = request.headers.get('host') || 'localhost:3001';
    // Always use HTTP in development mode
    const protocol = 'http';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    
    // Log environment variables to check if they're loaded
    console.log('Testing email configuration:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST || 'not set');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || 'not set');
    console.log('SMTP_USER exists:', !!process.env.SMTP_USER);
    console.log('SMTP_PASSWORD exists:', !!process.env.SMTP_PASSWORD);
    console.log('SMTP_FROM_EMAIL:', process.env.SMTP_FROM_EMAIL || 'not set');
    console.log('SEND_REAL_EMAILS:', process.env.SEND_REAL_EMAILS || 'not set');
    console.log('Base URL for test link:', baseUrl);

    // Generate a test email
    const testEmail = "hindavi815@gmail.com"; // Use your own email for testing
    const resetUrl = `${baseUrl}/reset-password?token=test-token-123`;
    
    console.log('Generating test email to:', testEmail);
    console.log('Using reset URL:', resetUrl);
    const emailOptions = generatePasswordResetEmail(testEmail, resetUrl);
    
    // Try to send the email directly with nodemailer
    const nodemailer = require('nodemailer');
    
    try {
      console.log('Creating Gmail transporter...');
      // Create a test account
      const testAccount = {
        user: process.env.SMTP_USER || 'hindavi815@gmail.com',
        pass: process.env.SMTP_PASSWORD || 'gdgiwlimrnklaola'
      };
      
      // Create Gmail transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
        debug: true // Enable extra debug logging
      });
      
      console.log('Gmail transporter created, sending email...');
      
      // Send a test email
      const info = await transporter.sendMail({
        from: `"IMS Test" <${testAccount.user}>`,
        to: testEmail,
        subject: "Test Email from IMS",
        text: "This is a test email from the IMS system for password reset functionality",
        html: emailOptions.html,
      });
      
      console.log('Email sent successfully: %s', info.messageId);
      
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully!",
        info: {
          messageId: info.messageId,
          response: info.response,
          account: `${testAccount.user.substring(0, 3)}***@${testAccount.user.split('@')[1]}`,
          resetUrl: resetUrl
        }
      });
    } catch (nodemailerError) {
      console.error('Nodemailer Error:', nodemailerError);
      return NextResponse.json({
        success: false,
        message: "Failed to send email directly through nodemailer",
        error: nodemailerError instanceof Error ? 
          { name: nodemailerError.name, message: nodemailerError.message, stack: nodemailerError.stack } : 
          String(nodemailerError),
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json({
      success: false,
      message: "An error occurred while sending test email",
      error: error instanceof Error ? 
        { name: error.name, message: error.message, stack: error.stack } : 
        String(error),
    }, { status: 500 });
  }
} 