// Server Component — carga recetas en el servidor.
// El usuario ve las recetas inmediatamente, sin spinner de carga inicial.
import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import RecipesClient from '@/components/admin/RecipesClient';

async function RecipesData() {
  const supabase = await createClient();
  const { data } = await supabase.from('recipes').select('*').order('name');
  return <RecipesClient initialData={data ?? []} />;
}

export default function RecipesPage() {
  return (
    <Suspense fallback={<GridSkeleton />}>
      <RecipesData />
    </Suspense>
  );
}

function GridSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center pb-6 border-b border-stone-200">
        <div className="h-9 bg-stone-100 rounded-xl w-40" />
        <div className="h-10 bg-stone-100 rounded-xl w-36" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-7 rounded-2xl border-2 border-stone-100 space-y-3">
            <div className="h-4 bg-stone-100 rounded w-20" />
            <div className="h-7 bg-stone-100 rounded w-3/4" />
            <div className="h-4 bg-stone-100 rounded w-full" />
            <div className="h-4 bg-stone-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
