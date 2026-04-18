import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // If Supabase env vars are missing, skip all auth logic and pass through.
  // This prevents MIDDLEWARE_INVOCATION_FAILED when env vars aren't set.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // IMPORTANT: Do not add logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very
    // hard to debug issues with users being randomly logged out.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Protected routes: require authentication
    const protectedPaths = ['/dashboard', '/wizard', '/admin'];
    const isProtected = protectedPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Admin routes: require admin role
    if (user && (pathname === '/admin' || pathname.startsWith('/admin/'))) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!profile || profile.role !== 'admin') {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          return NextResponse.redirect(url);
        }
      } catch {
        // If profile query fails, redirect to dashboard rather than crash
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    // Catch-all: if ANYTHING in the middleware throws (Supabase client
    // creation, auth check, cookie parsing), return NextResponse.next()
    // rather than letting the middleware crash with MIDDLEWARE_INVOCATION_FAILED.
    console.error('Middleware error (non-fatal):', error);
    return NextResponse.next({ request });
  }

  return supabaseResponse;
}
