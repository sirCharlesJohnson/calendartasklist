#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Todo Calendar App - Supabase Setup Helper\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env.local file not found!');
  console.log('Please create .env.local with your Supabase credentials.\n');
  process.exit(1);
}

// Read current .env.local
const envContent = fs.readFileSync(envPath, 'utf8');

// Check if still using placeholder values
if (envContent.includes('your_supabase_project_url') || envContent.includes('your_supabase_anon_key')) {
  console.log('⚠️  .env.local still contains placeholder values!');
  console.log('\nPlease update .env.local with your actual Supabase credentials:');
  console.log('1. Go to https://supabase.com');
  console.log('2. Create a new project');
  console.log('3. Go to Settings > API');
  console.log('4. Copy your Project URL and Anon Key');
  console.log('5. Update .env.local with the real values\n');
  
  console.log('Current .env.local content:');
  console.log(envContent);
} else {
  console.log('✅ .env.local appears to be configured!');
  console.log('\nNext steps:');
  console.log('1. Run the SQL script in your Supabase dashboard');
  console.log('2. Restart your development server: npm run dev');
  console.log('3. Test the app - todos should now persist!');
}

console.log('\n📖 For detailed instructions, see SUPABASE_SETUP.md');

