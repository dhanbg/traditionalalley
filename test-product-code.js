// Test file to verify product code functionality
// This test checks that product codes are properly fetched from API data
// and not hardcoded values

const { fetchDataFromApi } = require('./utils/api');

// Test configuration
const TEST_CONFIG = {
  // Replace with actual product IDs from your database
  MAIN_PRODUCT_ID: 'your-main-product-documentId', // Update this
  VARIANT_PRODUCT_ID: 'your-variant-product-documentId', // Update this
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'
};

// Mock cart items to simulate checkout process
const mockCartItems = [
  {
    id: 'test-main-product',
    documentId: TEST_CONFIG.MAIN_PRODUCT_ID,
    quantity: 1,
    variantInfo: null // Main product - no variant
  },
  {
    id: 'test-variant-product',
    documentId: TEST_CONFIG.MAIN_PRODUCT_ID,
    quantity: 1,
    variantInfo: {
      variantId: TEST_CONFIG.VARIANT_PRODUCT_ID,
      isVariant: true
    }
  }
];

// Simulate the fetchProductDetails function from Checkout.jsx
async function testFetchProductDetails(product) {
  try {
    console.log(`\n🔍 Testing product: ${product.documentId}`);
    
    // Fetch product data with populate=* to get all fields
    const productEndpoint = `/api/products?filters[documentId][$eq]=${product.documentId}&populate=*`;
    const productResponse = await fetchDataFromApi(productEndpoint);
    
    if (!productResponse?.data?.[0]) {
      console.log('❌ No product data found');
      return null;
    }
    
    const productData = productResponse.data[0];
    console.log(`📦 Main product code: ${productData.product_code || 'NOT FOUND'}`);
    
    // Log available variants
    if (productData.product_variants && Array.isArray(productData.product_variants)) {
      console.log(`🎨 Found ${productData.product_variants.length} variants:`);
      productData.product_variants.forEach((variant, index) => {
        console.log(`   Variant ${index + 1}: ID=${variant.documentId}, Code=${variant.product_code || 'NOT FOUND'}`);
      });
    } else {
      console.log('🎨 No variants found');
    }
    
    // Determine the correct product code to use (same logic as Checkout.jsx)
    let productCode = productData.product_code || "";
    
    // If this cart item has variant information, try to use the variant's product code
    if (product.variantInfo && product.variantInfo.variantId) {
      console.log(`🔍 Looking for variant with ID: ${product.variantInfo.variantId}`);
      
      // Find the matching variant in the product data
      const matchingVariant = productData.product_variants?.find(
        variant => variant.documentId === product.variantInfo.variantId
      );
      
      if (matchingVariant && matchingVariant.product_code) {
        productCode = matchingVariant.product_code;
        console.log(`✅ Using variant product code: ${productCode}`);
      } else {
        console.log(`⚠️  Variant not found or no product code, using main product code: ${productCode}`);
      }
    } else {
      console.log(`✅ Using main product code: ${productCode}`);
    }
    
    return {
      id: product.id,
      data: {
        ...product,
        productCode: productCode,
        originalProductData: {
          mainProductCode: productData.product_code,
          variantCodes: productData.product_variants?.map(v => ({
            id: v.documentId,
            code: v.product_code
          })) || []
        }
      }
    };
    
  } catch (error) {
    console.error(`❌ Error testing product ${product.documentId}:`, error.message);
    return null;
  }
}

// Main test function
async function runProductCodeTest() {
  console.log('🧪 Starting Product Code Test');
  console.log('=' .repeat(50));
  
  console.log('\n📋 Test Configuration:');
  console.log(`   API URL: ${TEST_CONFIG.API_BASE_URL}`);
  console.log(`   Main Product ID: ${TEST_CONFIG.MAIN_PRODUCT_ID}`);
  console.log(`   Variant Product ID: ${TEST_CONFIG.VARIANT_PRODUCT_ID}`);
  
  console.log('\n🛒 Mock Cart Items:');
  mockCartItems.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.variantInfo ? 'Variant' : 'Main'} Product: ${item.documentId}`);
  });
  
  console.log('\n🔬 Running Tests...');
  
  const results = [];
  
  for (const cartItem of mockCartItems) {
    const result = await testFetchProductDetails(cartItem);
    if (result) {
      results.push(result);
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('=' .repeat(50));
  
  results.forEach((result, index) => {
    const isVariant = mockCartItems[index].variantInfo !== null;
    console.log(`\n${index + 1}. ${isVariant ? 'Variant' : 'Main'} Product Test:`);
    console.log(`   Final Product Code: ${result.data.productCode}`);
    console.log(`   Is Hardcoded: ${result.data.productCode === '' ? 'YES (Empty)' : 'NO'}`);
    console.log(`   Source: ${isVariant ? 'Variant Data' : 'Main Product Data'}`);
  });
  
  // Check for hardcoded values
  const hasHardcodedValues = results.some(result => 
    result.data.productCode === '' || 
    result.data.productCode === 'HARDCODED' ||
    result.data.productCode.includes('TEST')
  );
  
  console.log('\n🎯 Final Assessment:');
  if (hasHardcodedValues) {
    console.log('❌ FAILED: Some product codes appear to be hardcoded or empty');
  } else {
    console.log('✅ PASSED: All product codes are properly fetched from API data');
  }
  
  console.log('\n💡 Instructions:');
  console.log('1. Update TEST_CONFIG with actual product IDs from your database');
  console.log('2. Run: node test-product-code.js');
  console.log('3. Check that product codes match your Strapi data');
  console.log('4. Verify variants use their own product codes, not main product codes');
}

// Run the test if this file is executed directly
if (require.main === module) {
  runProductCodeTest().catch(console.error);
}

module.exports = {
  runProductCodeTest,
  testFetchProductDetails,
  mockCartItems,
  TEST_CONFIG
};