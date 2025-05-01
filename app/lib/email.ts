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
  // This is a placeholder implementation
  // In development, we'll just log the email details
  if (process.env.NODE_ENV !== 'production') {
    console.log('========================');
    console.log('EMAIL WOULD BE SENT TO:', to);
    console.log('SUBJECT:', subject);
    console.log('HTML CONTENT:', html);
    console.log('========================');
    return true;
  }

  try {
    // Example implementation with a hypothetical email service
    // In a real app, you would replace this with your actual email provider's SDK

    // Example with NodeMailer (you would need to install and configure it)
    // const { createTransport } = require('nodemailer');
    // const transporter = createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: Number(process.env.SMTP_PORT || 587),
    //   secure: process.env.SMTP_SECURE === 'true',
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASSWORD,
    //   },
    // });
    // 
    // const info = await transporter.sendMail({
    //   from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    //   to,
    //   subject,
    //   html,
    // });
    // 
    // return !!info.messageId;

    // Example with SendGrid
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // const msg = {
    //   to,
    //   from: process.env.SENDGRID_FROM_EMAIL,
    //   subject,
    //   html,
    // };
    // await sgMail.send(msg);
    // return true;

    // For now, we'll simulate a successful email send
    return true;
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