// Server Component — puede leer cookies HttpOnly y autenticar con Supabase SSR.
// Las recetas se cargan aquí en el servidor y se pasan al Client Component KitchenView.
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import KitchenView from '@/components/kitchen/KitchenView';

export default async function KitchenPage() {
  const supabase = await createClient();

  // Verificar sesión activa (lee la cookie HttpOnly correctamente)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?mode=kitchen');
  }

  // Cargar recetas en el servidor — RLS ve al usuario autenticado y permite la lectura
  const { data: recipes, error } = await supabase.from('recipes').select('*').order('name');

  if (error) {
    // En caso de error de DB, mostrar estado vacío con mensaje claro
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#f5f0e8' }}
      >
        <div className="text-center p-10">
          <p className="font-black text-2xl mb-2" style={{ color: '#9d3e33' }}>
            Error al cargar recetas
          </p>
          <p className="font-bold text-sm" style={{ color: '#b0a890' }}>
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  // Pasar las recetas como props al Client Component que maneja la búsqueda
  return <KitchenView recipes={recipes ?? []} />;
}
