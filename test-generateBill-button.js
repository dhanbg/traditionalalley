/**
 * Test Generate Bill Button Functionality
 * This script tests the generate bill button with sample payment data
 */

const testPaymentData = {
  merchantTxnId: 'TEST-TXN-001',
  amount: 2500,
  amount_npr: 2500,
  status: 'SUCCESS',
  orderData: {
    receiver_details: {
      fullName: 'John Doe',
      email: 'gurungvaaiii@gmail.com', // Using the test email
      phone: '9841234567',
      countryCode: '+977',
      address: {
        addressLine1: '123 Test Street',
        cityName: 'Kathmandu',
        postalCode: '44600',
        countryCode: 'NP'
      }
    },
    products: [
      {
        name: 'Traditional Dhaka Kurta',
        productCode: 'TDK-001',
        size: 'M',
        color: 'Red',
        quantity: 1,
        price: 1500
      },
      {
        name: 'Nepali Topi',
        productCode: 'NT-002', 
        size: 'One Size',
        color: 'Black',
        quantity: 1,
        price: 1000
      }
    ],
    orderSummary: {
      totalAmount: 2500,
      finalSubtotal: 2500,
      productDiscounts: 0,
      couponDiscount: 0,
      shippingCost: 0,
      couponCode: null
    }
  },
  userBag: {
    id: 'test-bag-001'
  }
};

console.log('🧪 Generate Bill Button Test');
console.log('============================');
console.log('📋 Test Payment Data:');
console.log(JSON.stringify(testPaymentData, null, 2));

console.log('\n📧 Email Information:');
console.log('Customer Email:', testPaymentData.orderData.receiver_details.email);
console.log('Customer Name:', testPaymentData.orderData.receiver_details.fullName);

console.log('\n🔍 Testing Instructions:');
console.log('1. Open the browser and navigate to the admin dashboard');
console.log('2. Go to Orders page: http://localhost:3000/dashboard/orders');
console.log('3. Look for the Generate Bill button');
console.log('4. Click the Generate Bill button');
console.log('5. Check the browser console for debug logs');
console.log('6. Verify that:');
console.log('   - PDF is generated and downloaded');
console.log('   - Email is sent to gurungvaaiii@gmail.com');
console.log('   - No errors appear in console');

console.log('\n🔧 Debug Information to Look For:');
console.log('- 🔥 GENERATE BILL BUTTON CLICKED');
console.log('- 📋 Payment data being passed');
console.log('- 🔥 GENERATE BILL FUNCTION CALLED');
console.log('- 📧 Customer email found');
console.log('- ✅ Customer email found, proceeding to send invoice email');

console.log('\n📊 Expected Results:');
console.log('- PDF file downloaded: Traditional_Alley_Bill_TEST-TXN-001.pdf');
console.log('- Email sent to: gurungvaaiii@gmail.com');
console.log('- Success alert: "PDF generated and invoice email sent successfully!"');

console.log('\n⚠️  If Issues Occur:');
console.log('- Check if customer email is being extracted correctly');
console.log('- Verify orderData structure matches expected format');
console.log('- Ensure API endpoint /api/send-invoice-email is working');
console.log('- Check network tab for failed requests');

console.log('\n🎯 Test completed. Please follow the manual testing steps above.');