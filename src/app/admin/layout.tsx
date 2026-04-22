import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminSignOutButton from '@/components/admin/AdminSignOutButton';
import { AdminShell } from '@/components/admin/AdminShell';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-black text-stone-600 gap-4 bg-bistro-cream">
        <Lock size={48} className="text-bistro-red mb-4" />
        <h2 className="text-2xl text-bistro-red uppercase tracking-tighter">Acceso Restringido</h2>
        <p className="font-bold text-bistro-olive">Solo el administrador puede entrar a esta zona.</p>
        <Link
          href="/kitchen"
          className="mt-6 px-8 py-3 bg-bistro-green text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
        >
          Ir a Cocina
        </Link>
      </div>
    );
  }

  // Pass sign-out button as a slot so AdminShell (client) can render it
  return (
    <AdminShell signOutSlot={<AdminSignOutButton />}>
      {children}
    </AdminShell>
  );
}
