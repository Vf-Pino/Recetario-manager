import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // SDK con permisos administrativos (Inicializado dentro para evitar errores de build si faltan env vars)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
  try {
    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            console.log('Setting cookies in route is read-only');
          },
        },
      }
    );

    // 1. Validar que quien llama es verdaderamente un Admin
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    // 2. Actualizar app_config
    const { error: configError } = await supabaseAdmin
      .from('app_config')
      .update({ value: newPassword, updated_at: new Date().toISOString() })
      .eq('key', 'KITCHEN_MASTER_PASSWORD');

    // Manejar caso donde el key no exista previamente para insertarlo en su lugar
    if (configError) {
      const { error: insertError } = await supabaseAdmin
        .from('app_config')
        .insert({ key: 'KITCHEN_MASTER_PASSWORD', value: newPassword });

      if (insertError) {
        console.error('Error insertando config:', insertError);
        return NextResponse.json({ error: 'Error guardando en base de datos' }, { status: 500 });
      }
    }

    // 3. Opcional/Recomendado: Actualizar las contraseñas en Supabase Auth de todos los perfiles de cocina
    // Para asegurar que a partir de ahora, iniciar sesión exija la nueva contraseña.
    const { data: kitchenProfiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .in('role', ['kitchen_staff', 'pizza_station', 'grill_station', 'pasta_station', 'cleaning']);

    if (!profilesError && kitchenProfiles) {
      for (const prof of kitchenProfiles) {
        await supabaseAdmin.auth.admin.updateUserById(prof.id, {
          password: newPassword,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error en /api/admin/config/password:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
