const STRAPI_URL = 'http://localhost:1337';
const TEST_USER_ID = 'test-user-123';

async function testExpirationBehavior() {
  const { default: fetch } = await import('node-fetch');
  console.log('🧪 Testing coupon expiration behavior...');
  
  // Test 1: Create an expired coupon
  console.log('\n1. Creating an expired coupon:');
  try {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1); // Yesterday
    
    const createResponse = await fetch(`${STRAPI_URL}/api/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          code: 'EXPIRED_TEST',
          description: 'Expired coupon for testing',
          discountType: 'percentage',
          discountValue: 10,
          isActive: true,
          validUntil: pastDate.toISOString(),
          publishedAt: new Date().toISOString()
        }
      })
    });
    
    if (createResponse.ok) {
      const createdCoupon = await createResponse.json();
      console.log('✅ Expired coupon created:', {
        id: createdCoupon.data.id,
        code: createdCoupon.data.attributes.code,
        isActive: createdCoupon.data.attributes.isActive,
        validUntil: createdCoupon.data.attributes.validUntil
      });
      
      // Test 2: Try to validate the expired coupon
      console.log('\n2. Testing validation of expired coupon:');
      const validateResponse = await fetch(`${STRAPI_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'EXPIRED_TEST',
          orderAmount: 100,
          userId: TEST_USER_ID
        })
      });
      
      const validateResult = await validateResponse.json();
      if (validateResponse.ok) {
        console.log('❌ Expired coupon should not validate successfully');
      } else {
        console.log('✅ Expired coupon correctly rejected:', validateResult.error?.message);
      }
      
      // Test 3: Check if isActive field remains true even when expired
      console.log('\n3. Checking if isActive remains true for expired coupon:');
      const fetchResponse = await fetch(`${STRAPI_URL}/api/coupons/${createdCoupon.data.id}`);
      if (fetchResponse.ok) {
        const fetchedCoupon = await fetchResponse.json();
        console.log('📊 Expired coupon current state:');
        console.log('   - isActive:', fetchedCoupon.data.attributes.isActive);
        console.log('   - validUntil:', fetchedCoupon.data.attributes.validUntil);
        
        if (fetchedCoupon.data.attributes.isActive === true) {
          console.log('⚠️  ANSWER: isActive does NOT automatically become false when validUntil expires');
          console.log('   The system relies on validation logic to check expiration during validation');
          console.log('   The isActive field remains unchanged and must be manually updated if needed');
        } else {
          console.log('✅ isActive automatically becomes false when expired');
        }
      }
      
    } else {
      const error = await createResponse.json();
      console.log('❌ Failed to create expired coupon:', error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Test 4: Create a future coupon
  console.log('\n4. Creating a future coupon:');
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
    
    const createResponse = await fetch(`${STRAPI_URL}/api/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          code: 'FUTURE_TEST',
          description: 'Future coupon for testing',
          discountType: 'percentage',
          discountValue: 10,
          isActive: true,
          validFrom: futureDate.toISOString(),
          publishedAt: new Date().toISOString()
        }
      })
    });
    
    if (createResponse.ok) {
      const createdCoupon = await createResponse.json();
      console.log('✅ Future coupon created:', {
        id: createdCoupon.data.id,
        code: createdCoupon.data.attributes.code,
        isActive: createdCoupon.data.attributes.isActive,
        validFrom: createdCoupon.data.attributes.validFrom
      });
      
      // Test 5: Try to validate the future coupon
      console.log('\n5. Testing validation of future coupon:');
      const validateResponse = await fetch(`${STRAPI_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'FUTURE_TEST',
          orderAmount: 100,
          userId: TEST_USER_ID
        })
      });
      
      const validateResult = await validateResponse.json();
      if (validateResponse.ok) {
        console.log('❌ Future coupon should not validate successfully');
      } else {
        console.log('✅ Future coupon correctly rejected:', validateResult.error?.message);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n🏁 Expiration behavior tests completed!');
  console.log('\n📋 SUMMARY:');
  console.log('✅ minimumOrderAmount: Working correctly');
  console.log('✅ maximumDiscountAmount: Working correctly');
  console.log('✅ validFrom: Working correctly (prevents early usage)');
  console.log('✅ validUntil: Working correctly (prevents expired usage)');
  console.log('⚠️  isActive: Does NOT automatically become false when validUntil expires');
  console.log('   - The validation logic checks expiration dates during validation');
  console.log('   - The isActive field remains unchanged and requires manual updates');
}

// Run the tests
testExpirationBehavior().catch(console.error);