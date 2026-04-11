// Debug script for generateBill function errors
// This script helps identify issues in the PDF generation process

const fs = require('fs');
const path = require('path');

console.log('=== GenerateBill Error Debugging Tool ===\n');

// Check if jsPDF is properly installed
function checkJsPDFInstallation() {
  console.log('1. Checking jsPDF installation...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (dependencies.jspdf) {
      console.log('✅ jsPDF found in dependencies:', dependencies.jspdf);
    } else {
      console.log('❌ jsPDF not found in package.json');
      console.log('   Run: npm install jspdf');
    }
    
    if (dependencies['jspdf-autotable']) {
      console.log('✅ jsPDF AutoTable found:', dependencies['jspdf-autotable']);
    } else {
      console.log('❌ jsPDF AutoTable not found in package.json');
      console.log('   Run: npm install jspdf-autotable');
    }
  } catch (error) {
    console.log('❌ Error reading package.json:', error.message);
  }
}

// Check OrderManagement component imports
function checkImports() {
  console.log('\n2. Checking imports in OrderManagement.jsx...');
  try {
    const filePath = './components/admin/OrderManagement.jsx';
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for jsPDF imports
    if (content.includes("import jsPDF from 'jspdf'")) {
      console.log('✅ jsPDF import found');
    } else {
      console.log('❌ jsPDF import missing or incorrect');
      console.log('   Expected: import jsPDF from \'jspdf\';');
    }
    
    // Check for autoTable import
    if (content.includes("import autoTable from 'jspdf-autotable'")) {
      console.log('✅ jsPDF AutoTable import found');
    } else {
      console.log('❌ jsPDF AutoTable import missing or incorrect');
      console.log('   Expected: import autoTable from \'jspdf-autotable\';');
    }
    
    // Check for generateBill function
    if (content.includes('const generateBill = async (payment) => {')) {
      console.log('✅ generateBill function found');
    } else {
      console.log('❌ generateBill function not found or has different signature');
    }
    
  } catch (error) {
    console.log('❌ Error reading OrderManagement.jsx:', error.message);
  }
}

// Check for common PDF generation issues
function checkCommonIssues() {
  console.log('\n3. Common PDF Generation Issues to Check:');
  console.log('\n📋 Frontend Debugging Steps:');
  console.log('1. Open browser Developer Tools (F12)');
  console.log('2. Go to Console tab');
  console.log('3. Try generating a bill');
  console.log('4. Look for specific error messages');
  
  console.log('\n🔍 Common Error Patterns:');
  console.log('• "jsPDF is not defined" → Import issue');
  console.log('• "autoTable is not a function" → AutoTable import issue');
  console.log('• "Cannot read property of undefined" → Data structure issue');
  console.log('• "Image loading failed" → Logo loading issue (non-critical)');
  console.log('• "Payment data is missing" → Function called without proper data');
  
  console.log('\n🛠️ Quick Fixes:');
  console.log('1. Ensure all dependencies are installed:');
  console.log('   npm install jspdf jspdf-autotable');
  console.log('\n2. Check if the function is called with proper payment data');
  console.log('\n3. Verify the payment object structure in browser console');
  console.log('\n4. Check if logo.png exists in public folder');
}

// Check logo file
function checkLogo() {
  console.log('\n4. Checking logo file...');
  const logoPath = './public/logo.png';
  if (fs.existsSync(logoPath)) {
    console.log('✅ Logo file found at public/logo.png');
  } else {
    console.log('⚠️ Logo file not found at public/logo.png');
    console.log('   This is non-critical but may cause warnings');
  }
}

// Main execution
function main() {
  checkJsPDFInstallation();
  checkImports();
  checkLogo();
  checkCommonIssues();
  
  console.log('\n=== Next Steps ===');
  console.log('1. Run this in your browser console to test payment data:');
  console.log('   console.log("Payment object:", paymentObjectHere);');
  console.log('\n2. Check the exact error message in browser console');
  console.log('\n3. If imports are missing, install dependencies and restart dev server');
  console.log('\n4. Test with a simple payment object to isolate the issue');
}

main();