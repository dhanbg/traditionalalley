const { testBranchFetch } = require('../pages/api/ncm/branches');

async function runTest() {
  console.log('Testing NCM branch fetching...');
  
  const result = await testBranchFetch();
  
  if (result.success) {
    console.log('Success! Received branches:', result.branches);
  } else {
    console.error('Test failed:', result.error);
  }
}

runTest();
