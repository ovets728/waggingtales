import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/supabase/types';

export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile as Profile | null;
}

export async function requireAuth(): Promise<Profile> {
  const profile = await getCurrentUser();
  if (!profile) {
    redirect('/login');
  }
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentUser();
  if (!profile) {
    redirect('/login');
  }
  if (profile.role !== 'admin') {
    redirect('/dashboard');
  }
  return profile;
}

export async function requirePaid(): Promise<Profile> {
  const profile = await getCurrentUser();
  if (!profile) {
    redirect('/login');
  }
  if (!profile.has_paid) {
    redirect('/dashboard/upgrade');
  }
  return profile;
}
