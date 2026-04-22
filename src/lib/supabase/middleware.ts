import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
            })
          );
        },
      },
    }
  );

  // IMPORTANTE: No cambiar getUser() por getSession().
  // getUser() valida contra el servidor de Supabase (más seguro).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── MIDDLEWARE MINIMALISTA ──────────────────────────────────────────────────
  // Solo verifica: ¿existe sesión? Si sí, pasa. Si no, redirige a /login.
  // El control de autorización (qué puede ver) se hace dentro de cada página.
  // Esto elimina la Race Condition de roles que causaba el bucle de rebote.
  // ───────────────────────────────────────────────────────────────────────────

  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/kitchen');

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Preservar el modo para UX (regresa al login correcto)
    if (pathname.startsWith('/admin')) {
      url.searchParams.set('mode', 'admin');
    } else {
      url.searchParams.set('mode', 'kitchen');
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
