import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const templatePath = join(__dirname, '../public/firebase-messaging-sw.template.js');
const outputPath = join(__dirname, '../public/firebase-messaging-sw.js');
const envPath = join(__dirname, '../.env');

// Load .env file manually
function loadEnvFile() {
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          envVars[key.trim()] = value;
        }
      }
    });
    
    return envVars;
  } catch (error) {
    return {};
  }
}

// Load environment variables from .env file and process.env
const envFileVars = loadEnvFile();

// Read environment variables (prefer process.env, fallback to .env file)
const envVars = {
  VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || envFileVars.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN || envFileVars.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || envFileVars.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET || envFileVars.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || envFileVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID || envFileVars.VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_MEASUREMENT_ID: process.env.VITE_FIREBASE_MEASUREMENT_ID || envFileVars.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check for missing variables
const missing = Object.entries(envVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  console.error('Missing required environment variables:');
  missing.forEach(key => console.error(`  - ${key}`));
  process.exit(1);
}

// Read template
let template = readFileSync(templatePath, 'utf-8');

// Replace placeholders
Object.entries(envVars).forEach(([key, value]) => {
  const placeholder = `{{${key}}}`;
  template = template.replace(new RegExp(placeholder, 'g'), value);
});

// Write generated file
writeFileSync(outputPath, template, 'utf-8');
console.log('Service worker generated successfully');

