# Email Setup Guide

This guide will help you set up email functionality for the password reset feature in your application.

## Configuration

To enable email sending for the forgot password functionality, you need to set up the following environment variables in a `.env.local` file at the root of your project:

```
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SEND_REAL_EMAILS=true
```

## Setting up with Gmail

If you're using Gmail as your email provider, follow these steps:

### If you have 2-Step Verification enabled (recommended):

1. **Create an App Password**:
   - Go to your Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and your device, then click "Generate"
   - Use the generated 16-character password as your `SMTP_PASSWORD`
   - This is the ONLY way to make it work with 2FA enabled

2. **Update Environment Variables**:
   - Set `SMTP_USER` to your full Gmail address
   - Set `SMTP_PASSWORD` to the App Password you generated
   - Set `SMTP_FROM_EMAIL` to your Gmail address
   - Set `SEND_REAL_EMAILS` to "true"

### If you don't have 2-Step Verification:

1. **Enable Less Secure App Access**:
   - Go to your Google Account → Security
   - Turn on "Less secure app access" (Note: Google may not allow this option anymore)
   - This is less secure than using App Passwords

2. **Update Environment Variables** as above

## Common Gmail Issues and Solutions

1. **"Invalid login: 535-5.7.8 Username and Password not accepted"**
   - You are trying to use your regular Gmail password instead of an App Password
   - Solution: Generate an App Password as described above

2. **"Error: Invalid login: 534-5.7.9 Application-specific password required"**
   - Your account has 2FA enabled and requires an App Password
   - Solution: Generate an App Password as described above

3. **"Error: 5.7.0 Authentication Required"**
   - Gmail isn't accepting the authentication
   - Solution: Check that you're using the correct App Password and username

4. **"ECONNREFUSED or Connect timeout"**
   - The connection to Gmail servers is being blocked
   - Solution: Check your firewall or network settings

## Testing

After setting up the environment variables:

1. Restart your development server
2. Access the test URL: `http://localhost:3001/api/debug/test-email`
3. Check your email for the test message
4. Try the "Forgot Password" feature

## Verifying Configuration

You can verify your email configuration is working by:

1. Checking the console logs when sending email
2. Visiting the debug endpoint: `/api/debug/test-email`
3. Checking your spam/junk folders if emails aren't appearing in your inbox

## Gmail Security Notes

* Google prioritizes security and may block sign-in attempts from apps it doesn't recognize
* You might need to confirm that it was you trying to sign in via Gmail notifications
* If you continue to have issues, consider using a different email provider like SendGrid

## Other Email Providers

You can use other email providers by changing the SMTP settings accordingly:

- **Outlook/Office 365**: 
  - SMTP_HOST=smtp.office365.com
  - SMTP_PORT=587

- **Yahoo Mail**:
  - SMTP_HOST=smtp.mail.yahoo.com
  - SMTP_PORT=587

- **AWS SES**:
  - SMTP_HOST=email-smtp.{region}.amazonaws.com
  - SMTP_PORT=587

- **SendGrid**:
  - SMTP_HOST=smtp.sendgrid.net
  - SMTP_PORT=587 