/**
 * DHL Shipment Payload Diagnostic Tool
 * Logs the exact payload being sent to identify production vs local differences
 */

// Add this function to OrderManagement.jsx before the axios.post call
const debugShipmentPayload = (formData, payment) => {
  console.log('🚀 === DHL SHIPMENT PAYLOAD DEBUG ===');
  console.log('📦 Full formData:', JSON.stringify(formData, null, 2));
  
  // Check required fields
  const requiredFields = ['originAddress', 'destinationAddress', 'packages', 'plannedShippingDate', 'shipper', 'recipient'];
  console.log('✅ Required fields check:');
  requiredFields.forEach(field => {
    const exists = !!formData[field];
    console.log(`  ${field}: ${exists ? '✅' : '❌'} ${exists ? 'Present' : 'MISSING'}`);
  });
  
  // Check address fields
  console.log('🏠 Address validation:');
  ['originAddress', 'destinationAddress'].forEach(addressType => {
    console.log(`  ${addressType}:`);
    ['postalCode', 'cityName', 'countryCode'].forEach(field => {
      const value = formData[addressType]?.[field];
      const exists = !!value;
      console.log(`    ${field}: ${exists ? '✅' : '❌'} "${value}"`);
    });
  });
  
  // Check contact fields
  console.log('👤 Contact validation:');
  ['shipper', 'recipient'].forEach(contactType => {
    console.log(`  ${contactType}:`);
    ['fullName', 'email', 'phone'].forEach(field => {
      const value = formData[contactType]?.[field];
      const exists = !!value;
      console.log(`    ${field}: ${exists ? '✅' : '❌'} "${value}"`);
    });
    // Also check countryCode
    const countryCode = formData[contactType]?.countryCode;
    console.log(`    countryCode: ${countryCode ? '✅' : '❌'} "${countryCode}"`);
  });
  
  // Check packages
  console.log('📦 Package validation:');
  if (Array.isArray(formData.packages) && formData.packages.length > 0) {
    formData.packages.forEach((pkg, index) => {
      console.log(`  Package ${index + 1}:`);
      ['weight', 'length', 'width', 'height'].forEach(field => {
        const value = pkg[field];
        const isValid = value && value > 0;
        console.log(`    ${field}: ${isValid ? '✅' : '❌'} ${value}`);
      });
    });
  } else {
    console.log('  ❌ No packages or invalid packages array');
  }
  
  // Check shipping date
  console.log('📅 Shipping date validation:');
  const shippingDate = new Date(formData.plannedShippingDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isFutureDate = shippingDate >= today;
  console.log(`  plannedShippingDate: ${isFutureDate ? '✅' : '❌'} "${formData.plannedShippingDate}" (${isFutureDate ? 'Valid' : 'Past date'})`);
  
  // Original payment data
  console.log('💳 Original payment data:');
  console.log('  receiver_details:', JSON.stringify(payment.orderData?.receiver_details, null, 2));
  
  console.log('🏁 === END DEBUG ===');
};

// USAGE: Add this call in createShipment function before axios.post:
// debugShipmentPayload(formData, payment);

module.exports = { debugShipmentPayload };
