const nodemailer = require('nodemailer');
require('dotenv').config();

// Test Hostinger SMTP connection
async function testHostingerSMTP() {
  console.log('🧪 Testing Hostinger SMTP Connection');
  console.log('=' .repeat(50));
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('HOSTINGER_SMTP_HOST:', process.env.HOSTINGER_SMTP_HOST || 'NOT SET');
  console.log('HOSTINGER_SMTP_PORT:', process.env.HOSTINGER_SMTP_PORT || 'NOT SET');
  console.log('HOSTINGER_SMTP_USER:', process.env.HOSTINGER_SMTP_USER ? '✅ SET' : '❌ NOT SET');
  console.log('HOSTINGER_SMTP_PASS:', process.env.HOSTINGER_SMTP_PASS ? '✅ SET' : '❌ NOT SET');
  console.log('HOSTINGER_SMTP_FROM:', process.env.HOSTINGER_SMTP_FROM || 'NOT SET');
  console.log('');
  
  // Create transporter with Hostinger settings
  const hostingerConfig = {
    host: process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.HOSTINGER_SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.HOSTINGER_SMTP_USER,
      pass: process.env.HOSTINGER_SMTP_PASS,
    },
  };
  
  console.log('🔧 SMTP Configuration:');
  console.log('Host:', hostingerConfig.host);
  console.log('Port:', hostingerConfig.port);
  console.log('Secure:', hostingerConfig.secure);
  console.log('User:', hostingerConfig.auth.user ? '✅ SET' : '❌ NOT SET');
  console.log('Pass:', hostingerConfig.auth.pass ? '✅ SET' : '❌ NOT SET');
  console.log('');
  
  const transporter = nodemailer.createTransport(hostingerConfig);
  
  try {
    console.log('🔍 Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Try sending a test email
    console.log('\n📧 Sending test email to gurungvaaiii@gmail.com...');
    
    const mailOptions = {
      from: process.env.HOSTINGER_SMTP_FROM || '"Traditional Alley Support" <support@traditionalalley.com.np>',
      to: 'gurungvaaiii@gmail.com',
      subject: '🧪 Test Email from Traditional Alley - SMTP Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">🧪 SMTP Test Email</h2>
          <p>This is a test email to verify that the Hostinger SMTP configuration is working correctly.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Test Details:</h3>
            <ul>
              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
              <li><strong>SMTP Host:</strong> ${hostingerConfig.host}</li>
              <li><strong>SMTP Port:</strong> ${hostingerConfig.port}</li>
              <li><strong>From:</strong> ${process.env.HOSTINGER_SMTP_FROM}</li>
            </ul>
          </div>
          <p>If you received this email, the SMTP configuration is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated test email from Traditional Alley.</p>
        </div>
      `,
      text: `
        SMTP Test Email
        
        This is a test email to verify that the Hostinger SMTP configuration is working correctly.
        
        Test Details:
        - Time: ${new Date().toLocaleString()}
        - SMTP Host: ${hostingerConfig.host}
        - SMTP Port: ${hostingerConfig.port}
        - From: ${process.env.HOSTINGER_SMTP_FROM}
        
        If you received this email, the SMTP configuration is working correctly!
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📤 Response:', info.response);
    
    console.log('\n🎉 SMTP Test Results:');
    console.log('✅ Connection: SUCCESSFUL');
    console.log('✅ Email Sending: SUCCESSFUL');
    console.log('📧 Email should be delivered to: gurungvaaiii@gmail.com');
    
    console.log('\n📋 Next Steps:');
    console.log('1. Check gurungvaaiii@gmail.com inbox');
    console.log('2. Check spam/junk folder');
    console.log('3. Wait a few minutes for delivery');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ SMTP Test Failed!');
    console.error('Error:', error.message);
    
    if (error.code) {
      console.log('Error Code:', error.code);
    }
    
    console.log('\n🔧 Possible Issues:');
    
    if (error.message.includes('authentication') || error.message.includes('login')) {
      console.log('- ❌ Authentication failed: Check HOSTINGER_SMTP_USER and HOSTINGER_SMTP_PASS');
      console.log('- Verify credentials are correct in .env file');
      console.log('- Make sure the email account exists and password is correct');
    }
    
    if (error.message.includes('connection') || error.message.includes('timeout')) {
      console.log('- ❌ Connection failed: Check HOSTINGER_SMTP_HOST and HOSTINGER_SMTP_PORT');
      console.log('- Verify network connectivity');
      console.log('- Check if firewall is blocking SMTP ports');
    }
    
    if (error.message.includes('certificate') || error.message.includes('TLS')) {
      console.log('- ❌ TLS/SSL issue: Try different port or secure settings');
      console.log('- Port 587 with secure: false (STARTTLS)');
      console.log('- Port 465 with secure: true (SSL/TLS)');
    }
    
    console.log('\n💡 Environment Variables to Check:');
    console.log('- HOSTINGER_SMTP_HOST (should be smtp.hostinger.com)');
    console.log('- HOSTINGER_SMTP_PORT (should be 587 or 465)');
    console.log('- HOSTINGER_SMTP_USER (your email address)');
    console.log('- HOSTINGER_SMTP_PASS (your email password or app password)');
    console.log('- HOSTINGER_SMTP_FROM (sender email address)');
    
    return false;
  }
}

// Run the test
console.log('🚀 Starting Hostinger SMTP Test...');
console.log('🎯 Target: gurungvaaiii@gmail.com');
console.log('🔗 SMTP: Hostinger\n');

testHostingerSMTP()
  .then((success) => {
    if (success) {
      console.log('\n🎉 All tests passed! SMTP is working correctly.');
      process.exit(0);
    } else {
      console.log('\n💥 Tests failed! Please fix the issues above.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.log('\n💥 Unexpected error:', error.message);
    process.exit(1);
  });