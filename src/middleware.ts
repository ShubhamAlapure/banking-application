import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Avoid using getSession() which may read unvalidated storage
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;

  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');
  const isAdminRoute = path.startsWith('/admin');
  const isCustomerRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/transfer') ||
    path.startsWith('/beneficiaries') ||
    path.startsWith('/history');

  // 1. If not authenticated and trying to access protected routes
  if (!user && (isAdminRoute || isCustomerRoute)) {
    url.pathname = '/login';
    url.searchParams.set('redirect', path);
    url.searchParams.set('message', 'Please sign in to access this page.');
    return NextResponse.redirect(url);
  }

  // 2. If authenticated, fetch profile to check role
  if (user) {
    let role = user.user_metadata?.role;

    // Double check with database profile if role is not in user_metadata
    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      role = profile?.role || 'customer';
    }

    // Role-based protection: Admin routes are ONLY for admins
    if (isAdminRoute && role !== 'admin') {
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'unauthorized_admin');
      url.searchParams.set('message', 'Access denied. Administrator privileges are required.');
      return NextResponse.redirect(url);
    }

    // If authenticated user visits login or register, redirect to appropriate home
    if (isAuthRoute) {
      if (role === 'admin') {
        url.pathname = '/admin';
      } else {
        url.pathname = '/dashboard';
      }
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
