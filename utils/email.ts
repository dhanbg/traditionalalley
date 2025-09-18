import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(emailConfig);

// Verify connection configuration
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to take our messages');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return false;
  }
}

// Send OTP email for password reset
export async function sendResetPasswordOTP(email: string, otp: string, userName?: string) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Traditional Alley" <noreply@traditionalalley.com>',
      to: email,
      subject: '🔐 Reset Your Password - Traditional Alley',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - Traditional Alley</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🔐 Password Reset</h1>
                      <p style="margin: 8px 0 0 0; color: #e8f0ff; font-size: 16px;">Traditional Alley</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                        ${userName ? `Hi ${userName},` : 'Hello,'}
                      </p>
                      
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                        We received a request to reset your password for your Traditional Alley account. Use the verification code below to continue:
                      </p>
                      
                      <!-- OTP Code Box -->
                      <div style="text-align: center; margin: 30px 0;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; display: inline-block;">
                          <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                          <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
                        </div>
                      </div>
                      
                      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.5;">
                          <strong>⏰ Important:</strong> This code will expire in <strong>10 minutes</strong> for security reasons.
                        </p>
                      </div>
                      
                      <p style="margin: 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                        If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                      </p>
                      
                      <!-- Security Tips -->
                      <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #0d47a1; font-weight: 600;">🛡️ Security Tips:</p>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #1565c0; line-height: 1.5;">
                          <li>Never share your verification code with anyone</li>
                          <li>Traditional Alley will never ask for your password via email</li>
                          <li>Choose a strong, unique password for your account</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6c757d;">
                        Thanks for choosing Traditional Alley
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #adb5bd;">
                        If you have any questions, please contact our support team.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        Traditional Alley - Password Reset
        
        ${userName ? `Hi ${userName},` : 'Hello,'}
        
        We received a request to reset your password for your Traditional Alley account.
        
        Your verification code is: ${otp}
        
        This code will expire in 10 minutes for security reasons.
        
        If you didn't request this password reset, please ignore this email.
        
        Thanks,
        Traditional Alley Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Reset password OTP email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Failed to send reset password OTP email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Send OTP email for registration
export async function sendRegistrationOTP(email: string, otp: string, userName?: string) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Traditional Alley" <noreply@traditionalalley.com>',
      to: email,
      subject: '🎉 Welcome to Traditional Alley - Verify Your Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Traditional Alley</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🎉 Welcome!</h1>
                      <p style="margin: 8px 0 0 0; color: #e8fff0; font-size: 16px;">Traditional Alley</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                        ${userName ? `Hi ${userName},` : 'Hello,'}
                      </p>
                      
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                        Welcome to Traditional Alley! We're excited to have you join our community. To complete your registration, please verify your email address using the code below:
                      </p>
                      
                      <!-- OTP Code Box -->
                      <div style="text-align: center; margin: 30px 0;">
                        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border-radius: 12px; padding: 30px; display: inline-block;">
                          <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                          <p style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</p>
                        </div>
                      </div>
                      
                      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.5;">
                          <strong>⏰ Important:</strong> This code will expire in <strong>10 minutes</strong> for security reasons.
                        </p>
                      </div>
                      
                      <p style="margin: 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                        Once verified, you'll be able to explore our amazing collection of traditional products and enjoy a seamless shopping experience!
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6c757d;">
                        Thanks for choosing Traditional Alley
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #adb5bd;">
                        If you have any questions, please contact our support team.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        Traditional Alley - Email Verification
        
        ${userName ? `Hi ${userName},` : 'Hello,'}
        
        Welcome to Traditional Alley! Please verify your email address to complete your registration.
        
        Your verification code is: ${otp}
        
        This code will expire in 10 minutes for security reasons.
        
        Thanks,
        Traditional Alley Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Registration OTP email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Failed to send registration OTP email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Hostinger email configuration for invoice automation
const hostingerEmailConfig = {
  host: process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.HOSTINGER_SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.HOSTINGER_SMTP_USER,
    pass: process.env.HOSTINGER_SMTP_PASS,
  },
};

// Create Hostinger transporter for invoice emails
const hostingerTransporter = nodemailer.createTransport(hostingerEmailConfig);

// Verify Hostinger email connection
export async function verifyHostingerEmailConnection() {
  try {
    await hostingerTransporter.verify();
    console.log('✅ Hostinger email server is ready to send invoices');
    return true;
  } catch (error) {
    console.error('❌ Hostinger email server connection failed:', error);
    return false;
  }
}

// Send invoice email with PDF attachment
export async function sendInvoiceEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  invoicePdfBuffer: Buffer,
  orderDetails: any
) {
  try {
    const mailOptions = {
      from: process.env.HOSTINGER_SMTP_FROM || '"Traditional Alley Support" <support@traditionalalley.com.np>',
      to: customerEmail,
      subject: `📄 Invoice for Your Order #${orderId} - Traditional Alley`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice - Traditional Alley</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #2c5aa0 0%, #1e3a8a 100%); border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">📄 Invoice Ready</h1>
                      <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">Your order has been processed successfully</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Hello ${customerName}!</h2>
                      
                      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Thank you for your purchase! Your order <strong>#${orderId}</strong> has been successfully processed and your invoice is attached to this email.
                      </p>
                      
                      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: 600;">📋 Order Summary</h3>
                        <p style="margin: 5px 0; color: #4b5563; font-size: 14px;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="margin: 5px 0; color: #4b5563; font-size: 14px;"><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p style="margin: 5px 0; color: #4b5563; font-size: 14px;"><strong>Total Amount:</strong> ${orderDetails?.totalAmount || 'See invoice'}</p>
                        <p style="margin: 5px 0; color: #4b5563; font-size: 14px;"><strong>Payment Status:</strong> ${orderDetails?.paymentStatus || 'Completed'}</p>
                      </div>
                      
                      <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 500;">
                          📎 Your detailed invoice is attached as a PDF file to this email.
                        </p>
                      </div>
                      
                      <p style="margin: 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        If you have any questions about your order or need assistance, please don't hesitate to contact our support team.
                      </p>
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="mailto:support@traditionalalley.com.np" style="display: inline-block; background-color: #2c5aa0; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">Contact Support</a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6c757d;">
                        Thank you for choosing Traditional Alley
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #adb5bd;">
                        This is an automated message. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        Traditional Alley - Invoice for Order #${orderId}
        
        Hello ${customerName},
        
        Thank you for your purchase! Your order #${orderId} has been successfully processed.
        
        Order Details:
        - Order ID: ${orderId}
        - Order Date: ${new Date().toLocaleDateString()}
        - Total Amount: ${orderDetails?.totalAmount || 'See attached invoice'}
        - Payment Status: ${orderDetails?.paymentStatus || 'Completed'}
        
        Your detailed invoice is attached as a PDF file to this email.
        
        If you have any questions, please contact us at support@traditionalalley.com.np
        
        Thank you for choosing Traditional Alley!
      `,
      attachments: [
        {
          filename: `Invoice-${orderId}.pdf`,
          content: invoicePdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await hostingerTransporter.sendMail(mailOptions);
    console.log('✅ Invoice email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Failed to send invoice email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default {
  verifyEmailConnection,
  sendResetPasswordOTP,
  sendRegistrationOTP,
  verifyHostingerEmailConnection,
  sendInvoiceEmail
};