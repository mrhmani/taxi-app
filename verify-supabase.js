/* eslint-disable */
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Verifying Supabase connection...');
console.log('URL:', url || '(empty)');
console.log('Key:', key ? `${key.substring(0, 10)}...` : '(empty)');

if (!url || !key) {
  console.warn('WARNING: Environment variables VITE_SUPABASE_URL and/or VITE_SUPABASE_PUBLISHABLE_KEY are not configured yet in your .env file.');
  process.exit(0); // exit gracefully for now as placeholder is expected
}

try {
  const supabase = createClient(url, key);
  console.log('Attempting to fetch session from Supabase...');
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('ERROR: Connection failed with error:', error.message);
    process.exit(1);
  }
  
  console.log('SUCCESS: Supabase connection verified successfully!');
  process.exit(0);
} catch (err) {
  console.error('ERROR: Unexpected failure during connection check:', err.message);
  process.exit(1);
}
