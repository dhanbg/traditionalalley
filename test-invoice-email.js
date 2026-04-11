const nodemailer = require('nodemailer');
require('dotenv').config();

// Test the updated invoice email format
async function testInvoiceEmail() {
  console.log('🧪 Testing Updated Invoice Email Format');
  console.log('=' .repeat(50));
  
  // Create transporter with Hostinger settings (same as working test)
  const hostingerConfig = {
    host: process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.HOSTINGER_SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.HOSTINGER_SMTP_USER,
      pass: process.env.HOSTINGER_SMTP_PASS,
    },
  };
  
  const transporter = nodemailer.createTransport(hostingerConfig);
  
  try {
    console.log('📧 Sending test invoice email to gurungvaaiii@gmail.com...');
    
    // Create a simple PDF buffer for testing
    const testPdfContent = Buffer.from('This is a test PDF content for invoice testing', 'utf8');
    
    const mailOptions = {
      from: process.env.HOSTINGER_SMTP_FROM || '"Traditional Alley Support" <support@traditionalalley.com.np>',
      to: 'gurungvaaiii@gmail.com',
      subject: '📄 Invoice for Your Order #TEST-001 - Traditional Alley',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">📄 Invoice for Your Order</h2>
          <p>Hello Test Customer,</p>
          <p>Thank you for your purchase! Your order <strong>#TEST-001</strong> has been successfully processed and your invoice is attached to this email.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>📋 Order Details:</h3>
            <ul>
              <li><strong>Order ID:</strong> TEST-001</li>
              <li><strong>Order Date:</strong> ${new Date().toLocaleString()}</li>
              <li><strong>Customer:</strong> Test Customer</li>
              <li><strong>Total Amount:</strong> $99.99</li>
            </ul>
          </div>
          <p>📎 Your detailed invoice is attached as a PDF file to this email.</p>
          <p>If you have any questions about your order or need assistance, please don't hesitate to contact our support team at support@traditionalalley.com.np</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated email from Traditional Alley. Thank you for choosing us!</p>
        </div>
      `,
      text: `
        Invoice for Your Order #TEST-001 - Traditional Alley
        
        Hello Test Customer,
        
        Thank you for your purchase! Your order #TEST-001 has been successfully processed.
        
        Order Details:
        - Order ID: TEST-001
        - Order Date: ${new Date().toLocaleString()}
        - Customer: Test Customer
        - Total Amount: $99.99
        
        Your detailed invoice is attached as a PDF file to this email.
        
        If you have any questions, please contact us at support@traditionalalley.com.np
        
        Thank you for choosing Traditional Alley!
      `,
      attachments: [
        {
          filename: 'Invoice-TEST-001.pdf',
          content: testPdfContent,
          contentType: 'application/pdf'
        }
      ]
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test invoice email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📤 Response:', info.response);
    
    console.log('\n🎉 Invoice Email Test Results:');
    console.log('✅ Connection: SUCCESSFUL');
    console.log('✅ Email Sending: SUCCESSFUL');
    console.log('✅ Format: Updated to match working test email');
    console.log('📧 Email should be delivered to: gurungvaaiii@gmail.com');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Check gurungvaaiii@gmail.com inbox');
    console.log('2. Verify the email format matches the working test email');
    console.log('3. Test the Generate Bill button in the application');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ Invoice Email Test Failed!');
    console.error('Error:', error.message);
    return false;
  }
}

// Run the test
console.log('🚀 Starting Invoice Email Format Test...');
console.log('🎯 Target: gurungvaaiii@gmail.com');
console.log('🔗 SMTP: Hostinger\n');

testInvoiceEmail()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Invoice email test passed! Format updated successfully.');
      process.exit(0);
    } else {
      console.log('\n💥 Invoice email test failed! Please check the issues above.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.log('\n💥 Unexpected error:', error.message);
    process.exit(1);
  });