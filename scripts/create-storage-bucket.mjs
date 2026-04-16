#!/usr/bin/env node
/**
 * Creates a Supabase storage bucket for pet images and generated PDFs.
 * Reads credentials from .env.local.
 */

import './load-env.mjs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const BUCKET_NAME = 'uploads';

async function createBucket() {
  const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: BUCKET_NAME,
      name: BUCKET_NAME,
      public: true,
      file_size_limit: 10485760,
      allowed_mime_types: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
      ],
    }),
  });

  const body = await response.text();

  if (response.ok) {
    console.log(`✅ Bucket "${BUCKET_NAME}" created`);
    console.log('Response:', body);
    return;
  }

  if (response.status === 409 || body.includes('already exists') || body.includes('Duplicate')) {
    console.log(`⚠ Bucket "${BUCKET_NAME}" already exists — skipping`);
    return;
  }

  console.error(`❌ Failed to create bucket: ${response.status}`);
  console.error(body);
  process.exit(1);
}

async function listBuckets() {
  const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
    },
  });
  const buckets = await response.json();
  console.log('\nAll buckets:');
  console.log(buckets);
}

await createBucket();
await listBuckets();
