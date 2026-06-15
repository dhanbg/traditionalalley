const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

// Test 1: Original format
let parsed1 = dotenv.parse('NPS_SECRET_KEY=T$5nLz#o1Xp@');
dotenvExpand.expand({ parsed: parsed1 });
console.log('Result 1 (T$5nLz#o1Xp@):', parsed1.NPS_SECRET_KEY);

// Test 2: Double dollar escape
let parsed2 = dotenv.parse('NPS_SECRET_KEY=T$$5nLz#o1Xp@');
dotenvExpand.expand({ parsed: parsed2 });
console.log('Result 2 (T$$5nLz#o1Xp@):', parsed2.NPS_SECRET_KEY);

// Test 3: Backslash escape
let parsed3 = dotenv.parse('NPS_SECRET_KEY=T\\$5nLz#o1Xp@');
dotenvExpand.expand({ parsed: parsed3 });
console.log('Result 3 (T\\$5nLz#o1Xp@):', parsed3.NPS_SECRET_KEY);
