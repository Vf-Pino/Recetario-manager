// Server Component — carga la receta y sus ingredientes via SSR con sesión activa
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';
import RecipeViewer from '@/components/kitchen/RecipeViewer';

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Verificar sesión
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?mode=kitchen');
  }

  // Cargar receta
  const { data: recipe } = await supabase.from('recipes').select('*').eq('id', id).single();

  if (!recipe) {
    return (
      <div className="p-12 text-center text-white bg-bistro-red rounded-[3rem] font-black text-3xl flex flex-col items-center gap-6 mt-10 shadow-2xl mx-4">
        <TriangleAlert size={100} strokeWidth={2} />
        Receta no encontrada
      </div>
    );
  }

  // Cargar ingredientes con JOIN
  const { data: ingredients } = await supabase
    .from('recipe_ingredients')
    .select('*, ingredient:ingredients(*)')
    .eq('recipe_id', id);

  return <RecipeViewer recipe={recipe} ingredients={ingredients ?? []} />;
}
