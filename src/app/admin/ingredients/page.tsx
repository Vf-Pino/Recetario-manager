// Server Component — carga ingredientes en el servidor.
// El usuario ve los datos inmediatamente, sin spinner de carga inicial.
import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';
import IngredientsClient from '@/components/admin/IngredientsClient';

async function IngredientsData() {
  const supabase = await createClient();
  const { data } = await supabase.from('ingredients').select('*').order('name');
  return <IngredientsClient initialData={data ?? []} />;
}

export default function IngredientsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <IngredientsData />
    </Suspense>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center pb-6 border-b border-stone-200">
        <div className="h-9 bg-stone-100 rounded-xl w-56" />
        <div className="h-10 bg-stone-100 rounded-xl w-40" />
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200">
          <div className="h-10 bg-stone-100 rounded-xl w-64" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-4 p-5 border-b border-stone-100">
            <div className="h-5 bg-stone-100 rounded w-48" />
            <div className="h-5 bg-stone-100 rounded w-16 ml-auto" />
            <div className="h-5 bg-stone-100 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
