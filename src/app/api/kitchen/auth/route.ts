import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // SDK con permisos administrativos (Inicializado dentro para evitar errores de build si faltan env vars)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
    }

    // ── Paso 1: Verificar contraseña maestra en app_config ─────────────────
    const { data: config, error: configError } = await supabaseAdmin
      .from('app_config')
      .select('value')
      .eq('key', 'KITCHEN_MASTER_PASSWORD')
      .single();

    if (configError || !config) {
      return NextResponse.json(
        { error: 'Error del servidor. Contacte al administrador.' },
        { status: 500 }
      );
    }

    if (password !== config.value) {
      return NextResponse.json({ error: 'Contraseña de cocina incorrecta' }, { status: 401 });
    }

    // ── Paso 2: Asegurar que el usuario exista en Supabase Auth ────────────
    const {
      data: { users },
    } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!existingUser) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: config.value,
        email_confirm: true,
      });

      if (createError || !newUser.user) {
        return NextResponse.json(
          { error: 'No se pudo registrar el usuario automáticamente' },
          { status: 500 }
        );
      }

      await supabaseAdmin.from('profiles').upsert({
        id: newUser.user.id,
        email: newUser.user.email,
        role: 'kitchen_staff',
      });
    } else {
      // Sincronizar contraseña y rol
      await Promise.all([
        supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password: config.value,
        }),
        supabaseAdmin.from('profiles').upsert({
          id: existingUser.id,
          email: existingUser.email || email,
          role: 'kitchen_staff',
        }),
      ]);
    }

    // ── Paso 3: Hacer signIn y devolver las cookies SSR en la response ──────
    // Creamos la response primero para poder escribirle las cookies directamente.
    const response = NextResponse.json({ success: true });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookieHeader = request.headers.get('cookie') ?? '';
            return cookieHeader
              .split(';')
              .map((c) => {
                const [name, ...rest] = c.trim().split('=');
                return { name: name.trim(), value: rest.join('=').trim() };
              })
              .filter((c) => c.name);
          },
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

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: config.value,
    });

    if (authError || !authData.session) {
      return NextResponse.json(
        { error: 'Error al iniciar sesión. Intenta de nuevo.' },
        { status: 500 }
      );
    }

    return response;
  } catch (e: unknown) {
    const error = e as Error;
    console.error('[Kitchen] Error inesperado en cierre:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
