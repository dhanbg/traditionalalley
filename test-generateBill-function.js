// Test script to identify generateBill function errors
// This script helps test the PDF generation with sample data

console.log('=== Testing generateBill Function ===\n');

// Sample payment data structure for testing
const samplePaymentData = {
  merchantTxnId: 'TEST_TXN_123',
  attributes: {
    merchantTxnId: 'TEST_TXN_123'
  },
  orderData: {
    receiver_details: {
      email: 'test@example.com',
      fullName: 'Test Customer',
      address: '123 Test Street',
      city: 'Test City',
      country: 'United States',
      phone: '+1234567890'
    },
    products: [
      {
        name: 'Test Product 1',
        size: 'M',
        color: 'Red',
        quantity: 2,
        price: 25.99
      },
      {
        name: 'Test Product 2',
        size: 'L',
        color: 'Blue',
        quantity: 1,
        price: 35.50
      }
    ],
    orderSummary: {
      productDiscounts: 5.00,
      couponDiscount: 10.00,
      shippingCost: 8.99,
      finalSubtotal: 75.48
    }
  }
};

console.log('📋 Sample Payment Data Structure:');
console.log(JSON.stringify(samplePaymentData, null, 2));

console.log('\n🔧 Browser Testing Instructions:');
console.log('1. Open your application in the browser');
console.log('2. Open Developer Tools (F12)');
console.log('3. Go to Console tab');
console.log('4. Copy and paste this test code:');

console.log('\n--- COPY THIS CODE TO BROWSER CONSOLE ---');
console.log(`
// Test payment data
const testPayment = ${JSON.stringify(samplePaymentData, null, 2)};

// Test the generateBill function
console.log('Testing generateBill with sample data...');
console.log('Payment data:', testPayment);

// If you have access to the generateBill function, try:
// generateBill(testPayment).catch(error => {
//   console.error('GenerateBill error details:', error);
//   console.error('Error stack:', error.stack);
// });

// Alternative: Check if the function exists
if (typeof generateBill !== 'undefined') {
  console.log('✅ generateBill function is available');
} else {
  console.log('❌ generateBill function is not available in this scope');
}
`);

console.log('--- END OF BROWSER CODE ---\n');

console.log('🔍 What to Look For:');
console.log('1. Check if generateBill function is defined');
console.log('2. Look for specific error messages when calling the function');
console.log('3. Check if jsPDF and autoTable are properly loaded');
console.log('4. Verify the payment data structure matches expectations');

console.log('\n📝 Common Error Scenarios:');
console.log('• Missing or undefined payment data');
console.log('• Incorrect data structure (missing orderData, receiver_details, etc.)');
console.log('• jsPDF library not loaded properly');
console.log('• Image loading issues (logo.png)');
console.log('• Memory issues with large PDF generation');

console.log('\n🛠️ Debugging Steps:');
console.log('1. First, verify the exact error message in browser console');
console.log('2. Check if the payment object passed to generateBill has all required fields');
console.log('3. Test with minimal data to isolate the issue');
console.log('4. Check browser network tab for any failed resource loads');

console.log('\n✅ If the function works with test data:');
console.log('   → The issue is with the actual payment data being passed');
console.log('   → Check where generateBill is called and what data is provided');

console.log('\n❌ If the function fails with test data:');
console.log('   → The issue is with the function implementation or dependencies');
console.log('   → Check imports, library versions, or function logic');

console.log('\n=== Ready for Browser Testing ===');
console.log('Copy the code between the --- markers to your browser console');