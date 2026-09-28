import * as nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'mail.spacemail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.SMTP_PORT || '465') === 465, // true for 465 (SSL), false for other ports
  auth: {
    user: process.env.SMTP_USER || 'support@traditionalalley.com.np',
    pass: process.env.SMTP_PASS || 'Password@support99',
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
      from: process.env.SMTP_FROM || '"Traditional Alley" <support@traditionalalley.com.np>',
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
      from: process.env.SMTP_FROM || '"Traditional Alley" <support@traditionalalley.com.np>',
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

// Dedicated Invoice / Order Email Configuration (Spacemail)
const invoiceConfig = {
  host: process.env.INVOICE_SMTP_HOST || process.env.SMTP_HOST || 'mail.spacemail.com',
  port: parseInt(process.env.INVOICE_SMTP_PORT || process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.INVOICE_SMTP_PORT || process.env.SMTP_PORT || '465') === 465,
  auth: {
    user: process.env.INVOICE_SMTP_USER || 'order@traditionalalley.com.np',
    pass: process.env.INVOICE_SMTP_PASS || 'Password@order99',
  },
};

const invoiceTransporter = nodemailer.createTransport(invoiceConfig);

// Alias for backwards compatibility with any existing callers
export const hostingerTransporter = invoiceTransporter;
export const verifyHostingerEmailConnection = async () => {
  try {
    await invoiceTransporter.verify();
    return true;
  } catch (e) {
    return await verifyEmailConnection();
  }
};

// Send invoice email with PDF attachment
export async function sendInvoiceEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  invoicePdfBuffer: Buffer | null,
  orderDetails: any
) {
  try {
    const hasAttachment = invoicePdfBuffer && invoicePdfBuffer.length > 0;
    
    console.log('📧 Email method:', { hasAttachment });
    
    // Always use attached method since we're removing download links
    let invoiceAccessMethod = 'attached';
    
    const senderFrom = process.env.INVOICE_SMTP_FROM || '"Traditional Alley Orders" <order@traditionalalley.com.np>';

    // Customer Invoice Email
    const mailOptions: any = {
      from: senderFrom,
      to: customerEmail,
      replyTo: process.env.INVOICE_SMTP_USER || 'order@traditionalalley.com.np',
      subject: `📄 Invoice for Your Order #${orderId} - Traditional Alley`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; font-size: 28px; margin-bottom: 10px;">Hi ${customerName},</h1>
          <p>Thank you for your purchase! 🎉</p>
          <p>We're happy to let you know that your order has been successfully placed and payment has been received.</p>
          <p>Please wait for another email with your <strong>tracking number details</strong>.</p>
          <p>If you have any questions, feel free to reply to this email.</p>
          <p>Thank you for shopping with us. We truly appreciate your trust!</p>
          <p>📄 Please find your <strong>invoice attached</strong> for reference.</p>
          <p style="margin-top: 30px;">Best wishes,<br>Traditional Alley</p>
          <div style="margin-top: 30px; text-align: left;">
            <img src="https://admin.traditionalalley.com.np/uploads/talogo_2a1971baf9.png" alt="Traditional Alley Logo" style="width: 80px; height: 80px;">
          </div>
        </div>
      `,
      text: `
        Hi ${customerName},
        
        Thank you for your purchase! 🎉
        We're happy to let you know that your order has been successfully placed and payment has been received.
        
        Please wait for another email with your tracking number details.
        
        If you have any questions, feel free to reply to this email.
        
        Thank you for shopping with us. We truly appreciate your trust!
        
        Please find your invoice attached for reference.
        
        Best wishes,
        Traditional Alley
      `
    };
    
    // Add attachment only if we have a PDF buffer
    if (hasAttachment) {
      mailOptions.attachments = [
        {
          filename: `Invoice-${orderId}.pdf`,
          content: invoicePdfBuffer,
          contentType: 'application/pdf'
        }
      ];
    }

    const info = await invoiceTransporter.sendMail(mailOptions);
    console.log('✅ Invoice email sent successfully to customer:', info.messageId);

    // Send dedicated Admin Notification email to order@traditionalalley.com.np
    try {
      const primaryAdminEmail = 
        process.env.ADMIN_NOTIFICATION_EMAIL || 
        process.env.ORDER_NOTIFICATION_EMAIL || 
        process.env.INVOICE_SMTP_USER || 
        'order@traditionalalley.com.np';

      const adminRecipients: string[] = [primaryAdminEmail];
      if (process.env.SUPPORT_NOTIFICATION_EMAIL && !adminRecipients.includes(process.env.SUPPORT_NOTIFICATION_EMAIL)) {
        adminRecipients.push(process.env.SUPPORT_NOTIFICATION_EMAIL);
      }

      // Format shipping address
      let formattedAddress = 'N/A';
      if (typeof orderDetails?.address === 'object' && orderDetails?.address !== null) {
        const addr = orderDetails.address;
        formattedAddress = [
          addr.addressLine1 || addr.street || addr.streetAddress,
          addr.cityName || addr.city,
          addr.state || addr.zone,
          addr.postalCode || addr.zipCode,
          addr.countryCode || addr.country
        ].filter(Boolean).join(', ') || 'N/A';
      } else if (typeof orderDetails?.address === 'string' && orderDetails.address.trim()) {
        formattedAddress = orderDetails.address.trim();
      }

      // Format ordered items if present
      let productsHtml = '';
      let productsText = '';
      if (Array.isArray(orderDetails?.products) && orderDetails.products.length > 0) {
        productsHtml = `
          <div style="margin-top: 20px;">
            <h3 style="color: #1e293b; font-size: 15px; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">📦 Ordered Items:</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background-color: #f1f5f9; text-align: left; color: #475569;">
                  <th style="padding: 10px; border: 1px solid #e2e8f0;">Item</th>
                  <th style="padding: 10px; border: 1px solid #e2e8f0;">Size</th>
                  <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">Qty</th>
                  <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${orderDetails.products.map((p: any) => `
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: 500;">${p.title || p.name || 'Product'}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; color: #64748b;">${p.size || p.selectedSize || '-'}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; color: #0f172a;">${p.quantity || 1}</td>
                    <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-weight: 600;">${p.price || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

        productsText = `\nOrdered Items:\n` + orderDetails.products.map((p: any) => 
          `- ${p.title || p.name || 'Product'} (Size: ${p.size || p.selectedSize || '-'}, Qty: ${p.quantity || 1}, Price: ${p.price || '-'})`
        ).join('\n');
      }

      const totalAmount = orderDetails?.amount || 'See attached invoice';
      const paymentMethod = orderDetails?.paymentMethod || 'Online Payment';
      const phone = orderDetails?.phone || 'N/A';
      const shippingMethod = orderDetails?.shippingInfo?.method || orderDetails?.shippingInfo?.deliveryType 
        ? `${orderDetails.shippingInfo.method || 'Standard'} (${orderDetails.shippingInfo.deliveryType || 'Standard'})`
        : null;

      const adminMailOptions: any = {
        from: senderFrom,
        to: adminRecipients,
        subject: `🔔 [Admin Alert] New Order #${orderId} - ${totalAmount} (${customerName})`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: #ffffff; padding: 20px 24px; border-radius: 6px; margin-bottom: 24px;">
              <span style="background-color: rgba(255,255,255,0.25); font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Admin Notification</span>
              <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: bold; color: #ffffff;">🔔 New Order Arrived!</h1>
              <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">A new customer order has been placed on Traditional Alley.</p>
            </div>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
              <h3 style="color: #1e293b; font-size: 15px; margin: 0 0 12px 0;">📋 Order Overview:</h3>
              <table style="width: 100%; font-size: 14px; line-height: 1.7;">
                <tr>
                  <td style="width: 35%; color: #64748b; font-weight: 600;">Order ID:</td>
                  <td style="color: #0f172a; font-weight: bold;">#${orderId}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Total Amount:</td>
                  <td style="color: #16a34a; font-weight: bold; font-size: 16px;">${totalAmount}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Payment Method:</td>
                  <td style="color: #0f172a;">${paymentMethod}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Date:</td>
                  <td style="color: #0f172a;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
              <h3 style="color: #1e293b; font-size: 15px; margin: 0 0 12px 0;">👤 Customer & Shipping Details:</h3>
              <table style="width: 100%; font-size: 14px; line-height: 1.7;">
                <tr>
                  <td style="width: 35%; color: #64748b; font-weight: 600;">Customer Name:</td>
                  <td style="color: #0f172a; font-weight: 600;">${customerName}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Customer Email:</td>
                  <td style="color: #0f172a;"><a href="mailto:${customerEmail}" style="color: #2563eb; text-decoration: none;">${customerEmail}</a></td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Customer Phone:</td>
                  <td style="color: #0f172a;">${phone}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-weight: 600;">Shipping Address:</td>
                  <td style="color: #0f172a;">${formattedAddress}</td>
                </tr>
                ${shippingMethod ? `
                  <tr>
                    <td style="color: #64748b; font-weight: 600;">Shipping Method:</td>
                    <td style="color: #0f172a;">${shippingMethod}</td>
                  </tr>
                ` : ''}
              </table>
            </div>

            ${productsHtml}

            <div style="margin-top: 26px; text-align: center;">
              <a href="https://www.traditionalalley.com.np/dashboard/orders" 
                 style="display: inline-block; background-color: #8B4513; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 6px;">
                👉 Open Orders in Admin Dashboard
              </a>
            </div>

            <p style="margin-top: 24px; font-size: 13px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px;">
              📎 The customer's invoice PDF is attached to this notification.<br>
              Automated Admin Notification • Traditional Alley Order System
            </p>
          </div>
        `,
        text: `
🔔 [ADMIN ALERT] New Order Received!

Order Details:
- Order ID: #${orderId}
- Total Amount: ${totalAmount}
- Payment Method: ${paymentMethod}
- Date: ${new Date().toLocaleString()}

Customer Details:
- Name: ${customerName}
- Email: ${customerEmail}
- Phone: ${phone}
- Address: ${formattedAddress}
${shippingMethod ? `- Shipping: ${shippingMethod}` : ''}
${productsText}

Manage order in Admin Dashboard: https://www.traditionalalley.com.np/dashboard/orders

(The customer's invoice PDF is attached to this email)
        `
      };

      // Add attachment to admin email as well if available
      if (hasAttachment) {
        adminMailOptions.attachments = [
          {
            filename: `Invoice-${orderId}.pdf`,
            content: invoicePdfBuffer,
            contentType: 'application/pdf'
          }
        ];
      }

      const adminInfo = await invoiceTransporter.sendMail(adminMailOptions);
      console.log('✅ Admin order notification email sent successfully:', adminInfo.messageId);
    } catch (adminError) {
      console.error('⚠️ Failed to send admin order notification email:', adminError);
    }

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