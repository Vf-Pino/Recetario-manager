// Server Component — carga estadísticas en el servidor.
// Sin spinner, sin waterfall. Los datos llegan con el HTML inicial.
import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import DashboardClient from '@/components/admin/DashboardClient';

async function DashboardData() {
  const supabase = await createClient();

  // Queries en paralelo — tiempo total = la query más lenta, no la suma
  const [{ count: ingredients }, { count: recipes }] = await Promise.all([
    supabase.from('ingredients').select('*', { count: 'exact', head: true }),
    supabase.from('recipes').select('*', { count: 'exact', head: true }),
  ]);

  return <DashboardClient stats={{ ingredients: ingredients ?? 0, recipes: recipes ?? 0 }} />;
}

export default function AdminPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 bg-stone-100 rounded-xl w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-28 bg-stone-100 rounded-2xl" />
        <div className="h-28 bg-stone-100 rounded-2xl" />
      </div>
      <div className="h-48 bg-stone-100 rounded-2xl" />
    </div>
  );
}
