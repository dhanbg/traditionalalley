// Debug script to help identify issues in the invoice generation flow
// This script provides debugging utilities and checks

const fs = require('fs');
require('dotenv').config();

// Function to check if email addresses are valid
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to check common issues in order data
function validateOrderData(orderData) {
  console.log('🔍 Validating Order Data...');
  console.log('============================');
  
  const issues = [];
  const warnings = [];
  
  // Check if orderData exists
  if (!orderData) {
    issues.push('❌ Order data is null or undefined');
    return { issues, warnings, isValid: false };
  }
  
  console.log('📋 Order Data Structure:');
  console.log(JSON.stringify(orderData, null, 2));
  
  // Check receiver details
  const receiverDetails = orderData.receiver_details;
  if (!receiverDetails) {
    issues.push('❌ receiver_details is missing from order data');
  } else {
    console.log('\n📧 Receiver Details:');
    console.log('- Full Name:', receiverDetails.fullName || 'NOT SET');
    console.log('- Email:', receiverDetails.email || 'NOT SET');
    console.log('- Phone:', receiverDetails.phone || 'NOT SET');
    
    // Validate email
    if (!receiverDetails.email) {
      issues.push('❌ Customer email is missing from receiver_details');
    } else if (!validateEmail(receiverDetails.email)) {
      issues.push(`❌ Invalid email format: ${receiverDetails.email}`);
    } else {
      console.log('✅ Email format is valid');
    }
    
    // Check name
    if (!receiverDetails.fullName) {
      warnings.push('⚠️ Customer name is missing (will use "Valued Customer")');
    }
  }
  
  // Check transaction ID
  if (!orderData.txnId && !orderData.id) {
    warnings.push('⚠️ Transaction ID is missing (will use "N/A")');
  }
  
  // Check payment amount
  if (!orderData.amount && !orderData.total) {
    warnings.push('⚠️ Payment amount is missing');
  }
  
  const isValid = issues.length === 0;
  
  console.log('\n📊 Validation Summary:');
  console.log(`✅ Valid: ${isValid}`);
  console.log(`❌ Issues: ${issues.length}`);
  console.log(`⚠️ Warnings: ${warnings.length}`);
  
  if (issues.length > 0) {
    console.log('\n🚨 Critical Issues:');
    issues.forEach(issue => console.log(issue));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    warnings.forEach(warning => console.log(warning));
  }
  
  return { issues, warnings, isValid };
}

// Function to simulate the email sending process
function simulateEmailSending(orderData) {
  console.log('\n🧪 Simulating Email Sending Process...');
  console.log('======================================');
  
  const validation = validateOrderData(orderData);
  
  if (!validation.isValid) {
    console.log('❌ Cannot proceed with email sending due to validation errors');
    return false;
  }
  
  const receiverDetails = orderData.receiver_details;
  const emailData = {
    customerEmail: receiverDetails.email,
    customerName: receiverDetails.fullName || 'Valued Customer',
    orderId: orderData.txnId || orderData.id || 'N/A',
    amount: orderData.amount || orderData.total || 'See invoice',
    // pdfBase64 would be generated from jsPDF
    fileName: `Invoice-${orderData.txnId || orderData.id || 'N/A'}.pdf`
  };
  
  console.log('📤 Email Data to be sent:');
  console.log(JSON.stringify(emailData, null, 2));
  
  console.log('\n✅ Email sending simulation completed successfully');
  console.log('💡 If the actual email is not being sent, check:');
  console.log('   - Browser console for JavaScript errors');
  console.log('   - Network tab for failed API requests');
  console.log('   - Next.js server console for backend errors');
  
  return true;
}

// Function to provide debugging instructions
function providDebuggingInstructions() {
  console.log('\n🔧 Debugging Instructions for Invoice Email Issues');
  console.log('==================================================');
  
  console.log('\n1. 📱 Frontend Debugging (Browser):');
  console.log('   - Open browser Developer Tools (F12)');
  console.log('   - Go to Console tab');
  console.log('   - Generate an invoice and look for error messages');
  console.log('   - Check Network tab for failed requests to /api/send-invoice-email');
  
  console.log('\n2. 🖥️ Backend Debugging (Next.js Server):');
  console.log('   - Look at the terminal where "npm run dev" is running');
  console.log('   - Check for error messages when invoices are generated');
  console.log('   - Look for "Invoice email sent successfully" or error messages');
  
  console.log('\n3. 📧 Email Debugging:');
  console.log('   - Check spam/junk folder of recipient');
  console.log('   - Verify recipient email address is correct');
  console.log('   - Test with a different email address');
  console.log('   - Run the email test: node test-email-sending.js');
  
  console.log('\n4. 🔍 Data Debugging:');
  console.log('   - Add console.log statements in OrderManagement.jsx');
  console.log('   - Log the orderData before email sending');
  console.log('   - Verify receiver_details.email exists and is valid');
  
  console.log('\n5. 🚀 Quick Tests:');
  console.log('   - Run: node test-email-sending.js (test direct email)');
  console.log('   - Run: node test-invoice-api.js (test API endpoint)');
  console.log('   - Check browser console when generating invoices');
}

// Sample order data for testing
const sampleOrderData = {
  txnId: 'TXN123456',
  amount: 1500,
  currency: 'NPR',
  receiver_details: {
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+977-9841234567'
  },
  payment_status: 'completed'
};

// Main debugging function
function runDebugging() {
  console.log('🐛 Invoice Email Debugging Tool');
  console.log('===============================');
  
  console.log('\n📋 Testing with sample order data:');
  simulateEmailSending(sampleOrderData);
  
  providDebuggingInstructions();
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Try generating an invoice in the application');
  console.log('2. Check browser console and network tab');
  console.log('3. Check Next.js server console');
  console.log('4. If you see specific errors, investigate those areas');
  console.log('5. Test with a known working email address');
}

if (require.main === module) {
  runDebugging();
}

module.exports = {
  validateOrderData,
  simulateEmailSending,
  validateEmail,
  providDebuggingInstructions
};