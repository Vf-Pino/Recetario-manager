import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
              })
            );
          } catch {
            // Ignorar errores al limpiar cookies (puede ocurrir en Edge runtime)
          }
        },
      },
    }
  );

  // Destruir la sesión en el servidor de Supabase
  await supabase.auth.signOut();

  // Crear respuesta y destruir explícitamente TODAS las cookies de sesión de Supabase
  // usando maxAge=0 para que el navegador las elimine de forma INMEDIATA e IRREVOCABLE
  const response = NextResponse.json({ success: true });

  const allCookies = cookieStore.getAll();
  allCookies
    .filter((c) => c.name.startsWith('sb-'))
    .forEach((c) => {
      response.cookies.set(c.name, '', {
        maxAge: 0,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    });

  return response;
}
