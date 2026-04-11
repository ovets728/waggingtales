import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/supabase/types';

async function verifyAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') return null;

  return user;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);

  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  // Only allow updating has_paid and role
  const updateData: { has_paid?: boolean; role?: UserRole } = {};
  if (typeof body.has_paid === 'boolean') {
    updateData.has_paid = body.has_paid;
  }
  if (body.role === 'user' || body.role === 'admin') {
    updateData.role = body.role;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 }
    );
  }

  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(updatedProfile);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const admin = await verifyAdmin(supabase);

  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  // Prevent admin from deleting themselves
  if (admin.id === id) {
    return NextResponse.json(
      { error: 'Cannot delete your own account' },
      { status: 400 }
    );
  }

  // Delete the profile record
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Try to delete from auth.users using service role key
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let authDeleted = false;

  if (serviceRoleKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceRoleKey
      );
      const { error: authError } =
        await adminClient.auth.admin.deleteUser(id);
      if (!authError) {
        authDeleted = true;
      }
    } catch {
      // Service role key not available or invalid, profile already deleted
    }
  }

  if (!authDeleted) {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Auth-User-Deleted': 'false',
      },
    });
  }

  return new NextResponse(null, { status: 204 });
}
