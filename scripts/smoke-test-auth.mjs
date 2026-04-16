#!/usr/bin/env node
/**
 * Backend smoke test: create a user via admin API, verify profile trigger,
 * test the anon client can sign in, and verify RLS.
 * Reads credentials from .env.local.
 */

import './load-env.mjs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE) {
  console.error('❌ Missing env vars. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const TEST_EMAIL = `smoke-${Date.now()}@waggingtails-smoke.dev`;
const TEST_PASSWORD = 'SmokeTest123!';

const anon = createClient(SUPABASE_URL, ANON_KEY);
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let exitCode = 0;
let createdUserId = null;

async function step(name, fn) {
  process.stdout.write(`▶ ${name}... `);
  try {
    const result = await fn();
    console.log('✓');
    return result;
  } catch (err) {
    console.log('✗');
    console.error(`  Error: ${err.message || err}`);
    exitCode = 1;
    throw err;
  }
}

try {
  const user = await step('Create user via admin API', async () => {
    const { data, error } = await admin.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    if (!data.user) throw new Error('No user returned');
    createdUserId = data.user.id;
    return data.user;
  });
  console.log(`  User ID: ${createdUserId}`);
  console.log(`  Email: ${user.email}`);

  const profile = await step('Verify handle_new_user() trigger created profile', async () => {
    const { data, error } = await admin
      .from('profiles')
      .select('*')
      .eq('id', createdUserId)
      .single();
    if (error) throw error;
    return data;
  });
  console.log(`  profile.email: ${profile.email}`);
  console.log(`  profile.role: ${profile.role}`);
  console.log(`  profile.has_paid: ${profile.has_paid}`);

  await step('Profile has correct defaults', async () => {
    if (profile.email !== TEST_EMAIL) throw new Error(`email mismatch: ${profile.email}`);
    if (profile.role !== 'user') throw new Error(`role should be "user", got "${profile.role}"`);
    if (profile.has_paid !== false) throw new Error('has_paid should default to false');
  });

  const session = await step('Anon client can sign in with password', async () => {
    const { data, error } = await anon.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    if (error) throw error;
    if (!data.session) throw new Error('No session returned');
    return data.session;
  });
  console.log(`  Session token: ${session.access_token.slice(0, 20)}...`);

  await step('Authed client can read own profile', async () => {
    const authed = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });
    const { data, error } = await authed.from('profiles').select('*').eq('id', createdUserId).single();
    if (error) throw error;
    if (!data) throw new Error('Profile not found');
    if (data.email !== TEST_EMAIL) throw new Error('email mismatch in authed read');
  });

  await step('Unauthed anon client cannot see profile (RLS blocks)', async () => {
    const fresh = createClient(SUPABASE_URL, ANON_KEY);
    const { data } = await fresh.from('profiles').select('*').eq('id', createdUserId);
    if (data && data.length > 0) {
      throw new Error(`Anon saw ${data.length} row(s) it should not see`);
    }
  });

  await step('Authed user can update own profile', async () => {
    const authed = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    });
    const { error } = await authed
      .from('profiles')
      .update({ email: TEST_EMAIL })
      .eq('id', createdUserId);
    if (error) throw error;
  });
} catch {
  // Error already logged by step()
} finally {
  if (createdUserId) {
    process.stdout.write('▶ Cleanup: delete test user... ');
    try {
      await admin.auth.admin.deleteUser(createdUserId);
      console.log('✓');
    } catch (err) {
      console.log('✗');
      console.error(`  Cleanup error: ${err.message}`);
    }
  }
}

console.log(exitCode === 0 ? '\n✅ Auth smoke test PASSED' : '\n❌ Auth smoke test FAILED');
process.exit(exitCode);
