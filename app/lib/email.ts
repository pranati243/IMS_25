// app/lib/email.ts

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using the configured email service
 * 
 * Note: In a production app, you would integrate with an email service provider like:
 * - SendGrid
 * - AWS SES
 * - Mailgun
 * - Postmark
 * - etc.
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  // Log email details in both development and production
  console.log('========================');
  console.log('ATTEMPTING TO SEND EMAIL TO:', to);
  console.log('SUBJECT:', subject);
  console.log('========================');
  
  // Log environment variables for debugging
  console.log('EMAIL CONFIG DEBUG:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'not set');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || 'not set');
  console.log('SMTP_USER exists:', !!process.env.SMTP_USER);
  console.log('SMTP_PASSWORD exists:', !!process.env.SMTP_PASSWORD);
  console.log('SMTP_FROM_EMAIL:', process.env.SMTP_FROM_EMAIL || 'not set');
  console.log('SEND_REAL_EMAILS:', process.env.SEND_REAL_EMAILS || 'not set');
  console.log('========================');

  // In development, we'll log the email details only (unless SEND_REAL_EMAILS is true)
  if (process.env.NODE_ENV !== 'production' && process.env.SEND_REAL_EMAILS !== 'true') {
    console.log('DEVELOPMENT MODE: Email would be sent, but is being logged instead.');
    console.log('HTML CONTENT:', html);
    console.log('To send real emails in development, set SEND_REAL_EMAILS=true in .env.local');
    console.log('========================');
    return true;
  }

  try {
    // Use Gmail-specific configuration that should work reliably
    const nodemailer = require('nodemailer');
    
    const smtpUser = process.env.SMTP_USER || 'hindavi815@gmail.com';
    const smtpPass = process.env.SMTP_PASSWORD || 'gdgiwlimrnklaola';
    
    console.log(`Creating Gmail transporter for user: ${smtpUser}`);
    
    // Create a Gmail-specific transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    
    console.log('Gmail transporter created, attempting to send email...');
    
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"IMS FCRIT" <${smtpUser}>`,
      to,
      subject,
      html,
    });
    
    console.log('Email sent successfully: %s', info.messageId);
    return !!info.messageId;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Generate a password reset email
 */
export function generatePasswordResetEmail(email: string, resetUrl: string): EmailOptions {
  const subject = 'Reset Your Password';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #4f46e5; margin-bottom: 20px;">Reset Your Password</h2>
      <p>Hello,</p>
      <p>You requested a password reset for your account associated with ${email}.</p>
      <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #666; margin-bottom: 30px; font-size: 14px;">${resetUrl}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply to this message.</p>
    </div>
  `;

  return {
    to: email,
    subject,
    html
  };
} 