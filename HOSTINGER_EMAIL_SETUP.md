# Hostinger Email Setup Guide for Traditional Alley

This guide will help you configure your Hostinger business email (`support@traditionalalley.com.np`) for automated invoice emails.

## Prerequisites

- Hostinger Business Starter Email Plan (already purchased)
- Email account: `support@traditionalalley.com.np`
- Access to your Hostinger control panel

## Step 1: Configure Email Password in Hostinger

1. Log in to your Hostinger control panel
2. Navigate to **Email** section
3. Find your email account `support@traditionalalley.com.np`
4. Set or update the password for this email account
5. Make note of this password - you'll need it for the environment variables

## Step 2: Update Environment Variables

The `.env` file has already been configured with the Hostinger SMTP settings. You need to update the following variables with your actual credentials:

```env
# Hostinger Business Email Configuration
HOSTINGER_SMTP_HOST=smtp.hostinger.com
HOSTINGER_SMTP_PORT=587
HOSTINGER_SMTP_USER=support@traditionalalley.com.np
HOSTINGER_SMTP_PASS=your_email_password_here
HOSTINGER_SMTP_FROM=support@traditionalalley.com.np
```

**Important:** Replace `your_email_password_here` with the actual password you set for the email account.

## Step 3: Test Email Configuration

To test if your email configuration is working:

1. Start your development server: `npm run dev`
2. Go to the Order Management section in your admin panel
3. Generate a bill for any completed order
4. The system will automatically attempt to send an invoice email
5. Check the browser console and terminal for any error messages

## Step 4: Verify Email Delivery

1. Check the customer's email inbox (including spam folder)
2. Verify that the invoice PDF is attached correctly
3. Ensure the email content displays properly

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Double-check your email password
   - Ensure the email account is active in Hostinger
   - Verify the email address is exactly `support@traditionalalley.com.np`

2. **Connection Timeout**
   - Check your internet connection
   - Verify Hostinger SMTP server is accessible
   - Try using port 465 with SSL instead of 587 with TLS

3. **Email Not Received**
   - Check spam/junk folders
   - Verify the customer email address is correct
   - Check Hostinger email logs in your control panel

### Alternative Port Configuration:

If port 587 doesn't work, try using SSL on port 465:

```env
HOSTINGER_SMTP_PORT=465
# Note: You may need to update the email utility to use SSL instead of TLS
```

## Email Features

The automated email system includes:

- **Professional HTML email template** with Traditional Alley branding
- **PDF invoice attachment** with complete order details
- **Automatic currency conversion** (NPR for Nepal, USD for international)
- **Order summary** with itemized breakdown
- **Customer information** and shipping details
- **Server-side API route** for secure email processing (prevents Node.js module conflicts)

## Security Notes

- Never commit your actual email password to version control
- Use environment variables for all sensitive information
- Regularly update your email password for security
- Monitor email usage to prevent abuse

## Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Check the server terminal for Node.js errors
3. Verify your Hostinger email account status
4. Contact Hostinger support if SMTP issues persist

## Email Template Customization

The email template can be customized in `/utils/email.ts`:

- Update the HTML template in the `sendInvoiceEmail` function
- Modify the email subject line
- Add additional branding or messaging
- Include social media links or promotional content

## Technical Implementation

The system uses a server-side API route (`/pages/api/send-invoice-email.js`) to handle email sending, which:

- Prevents Node.js module conflicts in the browser
- Ensures secure email processing on the server
- Handles PDF attachment conversion from base64 to buffer
- Provides proper error handling and response formatting

---

**Note:** This setup enables automatic invoice emails whenever a bill is generated through the Order Management system. Customers will receive their invoice immediately after order completion.