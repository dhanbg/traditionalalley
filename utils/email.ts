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

export default {
  verifyEmailConnection,
  sendResetPasswordOTP,
  sendRegistrationOTP
}; 