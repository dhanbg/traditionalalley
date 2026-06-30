const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

function test(str) {
  let parsed = dotenv.parse(str);
  dotenvExpand.expand({ parsed });
  return parsed.NPS_SECRET_KEY;
}

// Test 1: Quoted
console.log('Test 1 (Quoted):', test('NPS_SECRET_KEY="T$5nLz#o1Xp@"'));

// Test 2: Quoted and backslash escaped dollar
console.log('Test 2 (Quoted escaped):', test('NPS_SECRET_KEY="T\\$5nLz#o1Xp@"'));

// Test 3: Quoted and double dollar
console.log('Test 3 (Quoted double-dollar):', test('NPS_SECRET_KEY="T$$5nLz#o1Xp@"'));
