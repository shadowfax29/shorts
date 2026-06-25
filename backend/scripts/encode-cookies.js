import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// We expect cookies.txt to be in the backend folder (one level up from scripts)
const cookiesPath = join(__dirname, '..', 'cookies.txt');

console.log('==================================================');
console.log('   DownloadShorts Cookie Base64 Encoder');
console.log('==================================================');

if (!existsSync(cookiesPath)) {
  console.error('\n❌ Error: cookies.txt not found in the backend/ directory.');
  console.error(`Expected path: ${cookiesPath}\n`);
  console.log('How to resolve this:');
  console.log('1. Install a browser extension like "Get cookies.txt LOCALLY"');
  console.log('   (available for Chrome, Edge, and Firefox).');
  console.log('2. Go to YouTube, make sure you are signed in, click the extension,');
  console.log('   and export your cookies.');
  console.log('3. Save or move the exported file to: backend/cookies.txt');
  console.log('4. Run this script again: node scripts/encode-cookies.js\n');
  process.exit(1);
}

try {
  const content = readFileSync(cookiesPath, 'utf-8');
  if (!content.trim()) {
    console.error('\n❌ Error: cookies.txt is empty.');
    process.exit(1);
  }
  
  const base64 = Buffer.from(content).toString('base64');
  console.log('\n✅ Success! Your YouTube cookies have been encoded to Base64.\n');
  console.log('------------------ COPY START ------------------');
  console.log(base64);
  console.log('------------------- COPY END -------------------\n');
  console.log('Instructions:');
  console.log('1. Copy the entire Base64 string above.');
  console.log('2. Go to your Render Dashboard (https://dashboard.render.com).');
  console.log('3. Open your Web Service settings and navigate to "Environment".');
  console.log('4. Add a new environment variable:');
  console.log('   - Key: YOUTUBE_COOKIES_B64');
  console.log('   - Value: [Paste the copied Base64 string here]');
  console.log('5. Save changes. Render will automatically redeploy, and the bot');
  console.log('   verification errors should disappear!\n');
} catch (err) {
  console.error('\n❌ Failed to encode cookies:', err.message);
}
