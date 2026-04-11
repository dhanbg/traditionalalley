// Debug script to test video URL construction
const { getImageUrl } = require('./utils/api.js');

// Test video URL construction
const testVideoUrl = '/uploads/Whats_App_Video_2025_08_08_at_12_33_40_4dd31815_f71724b27a.mp4';
const constructedUrl = getImageUrl(testVideoUrl);

console.log('Original URL:', testVideoUrl);
console.log('Constructed URL:', constructedUrl);
console.log(`Expected URL: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/uploads/Whats_App_Video_2025_08_08_at_12_33_40_4dd31815_f71724b27a.mp4`);

// Test if the constructed URL matches what we expect
const expectedUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337'}/uploads/Whats_App_Video_2025_08_08_at_12_33_40_4dd31815_f71724b27a.mp4`;
if (constructedUrl === expectedUrl) {
  console.log('✅ URL construction is correct');
} else {
  console.log('❌ URL construction is incorrect');
  console.log('Difference:', constructedUrl, 'vs', expectedUrl);
}