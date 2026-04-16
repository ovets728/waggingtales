#!/usr/bin/env node
/**
 * Runs all SQL migrations in supabase/migrations/ against the Supabase Postgres DB.
 * Reads credentials from .env.local via SUPABASE_DB_PASSWORD and NEXT_PUBLIC_SUPABASE_URL.
 */

import './load-env.mjs';
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
  process.exit(1);
}

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
if (!dbPassword) {
  console.error('❌ SUPABASE_DB_PASSWORD is not set in .env.local');
  process.exit(1);
}

// Extract project ref from URL: https://<ref>.supabase.co
const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

const connectionStrings = [
  `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`,
];

async function run() {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration file(s):`, files);

  let client;
  let connected = false;
  let lastError;

  for (const connString of connectionStrings) {
    const safeStr = connString.replace(dbPassword, '***');
    console.log(`\nAttempting connection: ${safeStr}`);
    client = new pg.Client({
      connectionString: connString,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      connected = true;
      console.log('✓ Connected to Supabase Postgres');
      break;
    } catch (err) {
      lastError = err;
      console.log(`✗ Failed: ${err.message}`);
      try {
        await client.end();
      } catch {}
    }
  }

  if (!connected) {
    console.error('\n❌ Could not connect to the database with any method.');
    console.error('Last error:', lastError?.message);
    process.exit(1);
  }

  for (const file of files) {
    const sqlPath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`\n▶ Running ${file}...`);
    try {
      await client.query(sql);
      console.log(`✓ ${file} applied successfully`);
    } catch (err) {
      if (
        err.message.includes('already exists') ||
        err.code === '42P07' ||
        err.code === '42710'
      ) {
        console.log(`⚠ ${file} skipped (already applied): ${err.message}`);
      } else {
        console.error(`✗ ${file} failed:`, err.message);
        await client.end();
        process.exit(1);
      }
    }
  }

  console.log('\n▶ Verifying tables...');
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name IN ('profiles', 'story_projects')
     ORDER BY table_name`
  );
  console.log('Tables present:', rows.map((r) => r.table_name));

  await client.end();
  console.log('\n✅ Migrations complete');
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
