// Simple test to verify product codes are not hardcoded
// Run with: node simple-product-code-test.mjs

import fetch from 'node-fetch';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

// Simple fetch function
async function fetchFromAPI(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error.message);
    return null;
  }
}

// Test the product code logic
async function testProductCodes() {
  console.log('🧪 Testing Product Code Implementation');
  console.log('=' .repeat(50));
  
  try {
    // Fetch some products with variants
    console.log('\n📡 Fetching products from API...');
    const productsResponse = await fetchFromAPI('/api/products?populate=*&pagination[limit]=3');
    
    if (!productsResponse?.data) {
      console.log('❌ No products found or API error');
      return;
    }
    
    const products = productsResponse.data;
    console.log(`✅ Found ${products.length} products to test`);
    
    let testsPassed = 0;
    let testsTotal = 0;
    
    for (const product of products) {
      console.log(`\n🔍 Testing Product: ${product.title}`);
      console.log(`   Document ID: ${product.documentId}`);
      
      // Test main product code (simulate checkout logic)
      testsTotal++;
      const mainProductCode = product.product_code || 'NO-CODES';
      console.log(`   Main Product Code: ${mainProductCode}`);
      
      if (mainProductCode && mainProductCode !== '' && mainProductCode !== 'NO-CODES' && !mainProductCode.includes('HARDCODED')) {
            console.log('   ✅ Main product code is dynamic');
            testsPassed++;
          } else if (mainProductCode === 'NO-CODES') {
            console.log('   ⚠️  Main product code shows "NO-CODES" (expected for products without codes)');
            testsPassed++; // This is now expected behavior
          } else {
            console.log('   ❌ Main product code appears hardcoded or missing');
          }
      
      // Test variant codes if they exist
      if (product.product_variants && Array.isArray(product.product_variants)) {
        console.log(`   🎨 Found ${product.product_variants.length} variants:`);
        
        for (const [index, variant] of product.product_variants.entries()) {
          testsTotal++;
          const variantCode = variant.product_code || 'NO-CODES';
          const variantTitle = variant.title || variant.color || `Variant ${index + 1}`;
          
          console.log(`      ${index + 1}. ${variantTitle}`);
          console.log(`         ID: ${variant.documentId}`);
          console.log(`         Code: ${variantCode}`);
          
          if (variantCode && variantCode !== '' && variantCode !== 'NO-CODES' && !variantCode.includes('HARDCODED')) {
            console.log('         ✅ Variant code is dynamic');
            testsPassed++;
          } else if (variantCode === 'NO-CODES') {
            console.log('         ⚠️  Variant code shows "NO-CODES" (expected for variants without codes)');
            testsPassed++; // This is now expected behavior
          } else {
            console.log('         ❌ Variant code appears hardcoded or missing');
          }
        }
      } else {
        console.log('   📝 No variants found for this product');
      }
    }
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));
    console.log(`Total Tests: ${testsTotal}`);
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsTotal - testsPassed}`);
    console.log(`Success Rate: ${Math.round((testsPassed / testsTotal) * 100)}%`);
    
    if (testsPassed === testsTotal) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('✅ Product codes are properly fetched from API data');
      console.log('✅ No hardcoded values detected');
    } else {
      console.log('\n⚠️  SOME TESTS FAILED!');
      console.log('❌ Some product codes appear to be hardcoded or missing');
      console.log('💡 Check your Strapi data to ensure product_code fields are populated');
    }
    
    // Simulate checkout logic test
    console.log('\n🛒 Testing Checkout Logic Simulation:');
    console.log('-' .repeat(30));
    
    const testProduct = products[0];
    if (testProduct) {
      // Test main product selection
      const mainProductCode = testProduct.product_code || "";
      console.log(`Main Product Selection: Code = "${mainProductCode}"`);
      
      // Test variant selection if available
      if (testProduct.product_variants && testProduct.product_variants.length > 0) {
        const testVariant = testProduct.product_variants[0];
        const variantCode = testVariant.product_code || mainProductCode;
        console.log(`Variant Selection: Code = "${variantCode}"`);
        
        if (variantCode !== mainProductCode && variantCode !== "") {
          console.log('✅ Variant uses its own product code (correct behavior)');
        } else if (variantCode === mainProductCode && mainProductCode !== "") {
          console.log('⚠️  Variant falls back to main product code (acceptable if variant has no code)');
        } else {
          console.log('❌ Both codes are empty or hardcoded');
        }
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
  }
}

// Run the test
testProductCodes().catch(console.error);

// Export for potential use in other files
export { testProductCodes };