const STRAPI_URL = 'http://localhost:1337';
const TEST_USER_ID = 'test-user-123';

async function testCouponValidation() {
  const { default: fetch } = await import('node-fetch');
  console.log('🧪 Starting comprehensive coupon validation tests...');
  
  // Test 1: Valid coupon with sufficient order amount
  console.log('\n1. Testing valid coupon with sufficient order amount:');
  try {
    const response = await fetch(`${STRAPI_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'SAVE10',
        orderAmount: 100,
        userId: TEST_USER_ID
      })
    });
    const result = await response.json();
    console.log('✅ Valid coupon test:', result);
    console.log('   - Discount Amount:', result.coupon?.discountAmount);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 2: minimumOrderAmount validation
  console.log('\n2. Testing minimumOrderAmount validation:');
  try {
    const response = await fetch(`${STRAPI_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'WELCOMETA', // Has minimumOrderAmount: 50
        orderAmount: 30, // Below minimum
        userId: TEST_USER_ID
      })
    });
    const result = await response.json();
    if (response.ok) {
      console.log('❌ Should have failed minimum order validation');
    } else {
      console.log('✅ Minimum order validation working:', result.error?.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 3: maximumDiscountAmount validation
  console.log('\n3. Testing maximumDiscountAmount validation:');
  try {
    const response = await fetch(`${STRAPI_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'SAVE10', // 10% discount, max $50
        orderAmount: 1000, // Would give $100 discount, but capped at $50
        userId: TEST_USER_ID
      })
    });
    const result = await response.json();
    console.log('✅ Maximum discount test:', result);
    console.log('   - Order Amount: $1000');
    console.log('   - Expected Discount: $50 (capped)');
    console.log('   - Actual Discount:', result.coupon?.discountAmount);
    console.log('   - Maximum discount working:', result.coupon?.discountAmount === 50 ? '✅' : '❌');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 4: validFrom validation (create a future coupon)
  console.log('\n4. Testing validFrom validation:');
  try {
    // First create a future coupon
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
    
    const createResponse = await fetch(`${STRAPI_URL}/api/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          code: 'FUTURE10',
          description: 'Future coupon test',
          discountType: 'percentage',
          discountValue: 10,
          isActive: true,
          validFrom: futureDate.toISOString(),
          publishedAt: new Date().toISOString()
        }
      })
    });
    
    if (createResponse.ok) {
      // Now try to validate the future coupon
      const validateResponse = await fetch(`${STRAPI_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'FUTURE10',
          orderAmount: 100,
          userId: TEST_USER_ID
        })
      });
      const result = await validateResponse.json();
      if (validateResponse.ok) {
        console.log('❌ Should have failed validFrom validation');
      } else {
        console.log('✅ validFrom validation working:', result.error?.message);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 5: validUntil validation (create an expired coupon)
  console.log('\n5. Testing validUntil validation:');
  try {
    // First create an expired coupon
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday
    
    const createResponse = await fetch(`${STRAPI_URL}/api/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          code: 'EXPIRED10',
          description: 'Expired coupon test',
          discountType: 'percentage',
          discountValue: 10,
          isActive: true,
          validUntil: pastDate.toISOString(),
          publishedAt: new Date().toISOString()
        }
      })
    });
    
    if (createResponse.ok) {
      // Now try to validate the expired coupon
      const validateResponse = await fetch(`${STRAPI_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'EXPIRED10',
          orderAmount: 100,
          userId: TEST_USER_ID
        })
      });
      const result = await validateResponse.json();
      if (validateResponse.ok) {
        console.log('❌ Should have failed validUntil validation');
      } else {
        console.log('✅ validUntil validation working:', result.error?.message);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 6: Check if isActive automatically becomes false when validUntil expires
  console.log('\n6. Testing automatic isActive expiration:');
  try {
    // Check if expired coupons are automatically filtered out
    const response = await fetch(`${STRAPI_URL}/api/coupons?filters[code][$eq]=EXPIRED10`);
    const result = await response.json();
    
    if (result.data && result.data.length > 0) {
      const expiredCoupon = result.data[0];
      console.log('📊 Expired coupon status:');
      console.log('   - Code:', expiredCoupon.attributes.code);
      console.log('   - isActive:', expiredCoupon.attributes.isActive);
      console.log('   - validUntil:', expiredCoupon.attributes.validUntil);
      
      if (expiredCoupon.attributes.isActive === true) {
        console.log('⚠️  isActive does NOT automatically become false when validUntil expires');
        console.log('   The system relies on validation logic to check expiration, not automatic field updates');
      } else {
        console.log('✅ isActive automatically becomes false when expired');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n🏁 Comprehensive coupon validation tests completed!');
}

// Run the tests
testCouponValidation().catch(console.error);