import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
  }

  // Creamos la response al inicio para poder escribir en sus cookies.
  // Es la ÚNICA forma correcta de propagar cookies con @supabase/ssr en API Routes.
  const response = NextResponse.json({ success: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // El cliente SSR llama a getAll() para leer las cookies actuales del request
        getAll() {
          // En API Routes no hay acceso directo a request.cookies de Next,
          // pero podemos parsear el header Cookie manualmente
          const cookieHeader = request.headers.get('cookie') ?? '';
          return cookieHeader
            .split(';')
            .map((c) => {
              const [name, ...rest] = c.trim().split('=');
              return { name: name.trim(), value: rest.join('=').trim() };
            })
            .filter((c) => c.name);
        },
        // El cliente SSR llama a setAll() cuando tiene tokens nuevos para guardar.
        // Los escribimos DIRECTAMENTE en la response HTTP. Este es el patrón correcto.
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
  }

  // En este punto, setAll() ya fue llamado internamente y las cookies
  // están escritas en `response`. Solo retornamos la response.
  return response;
}
