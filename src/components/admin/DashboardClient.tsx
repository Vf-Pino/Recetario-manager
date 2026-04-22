'use client';
import { useState } from 'react';
import { Beaker, FileText } from 'lucide-react';
import Link from 'next/link';
import CSVImporter from '@/components/admin/CSVImporter';

interface Props {
  stats: { ingredients: number; recipes: number };
}

export default function DashboardClient({ stats: initialStats }: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMessage({ text: 'Debe tener al menos 6 caracteres.', type: 'error' });
      return;
    }
    setUpdatingPassword(true);
    setPasswordMessage({ text: '', type: '' });
    try {
      const res = await fetch('/api/admin/config/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar');
      setPasswordMessage({
        text: 'Contraseña maestra actualizada correctamente.',
        type: 'success',
      });
      setNewPassword('');
    } catch (err: unknown) {
      const error = err as Error;
      setPasswordMessage({ text: error.message, type: 'error' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h2 className="text-3xl font-black text-bistro-green tracking-tight">Estadísticas</h2>
        <p className="text-stone-500 font-medium mt-1">Resumen operativo de producción</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Link
          href="/admin/ingredients"
          className="bg-white p-6 rounded-2xl border-2 border-bistro-green/5 shadow-sm flex items-start gap-4 hover:border-bistro-gold group transition-all"
        >
          <div className="bg-stone-100 group-hover:bg-bistro-cream transition-colors p-4 rounded-xl text-stone-600 group-hover:text-bistro-green">
            <Beaker size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-stone-500 font-bold text-xs uppercase tracking-wider mb-1">
              Materia Prima
            </p>
            <p className="text-3xl font-black text-bistro-green">
              {initialStats.ingredients}{' '}
              <span className="text-sm text-stone-400 font-semibold tracking-normal">Items</span>
            </p>
          </div>
        </Link>

        <Link
          href="/admin/recipes"
          className="bg-white p-6 rounded-2xl border-2 border-bistro-green/5 shadow-sm flex items-start gap-4 hover:border-bistro-gold group transition-all"
        >
          <div className="bg-stone-100 group-hover:bg-bistro-cream transition-colors p-4 rounded-xl text-stone-600 group-hover:text-bistro-green">
            <FileText size={26} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-stone-500 font-bold text-xs uppercase tracking-wider mb-1">
              Total de Recetas
            </p>
            <p className="text-3xl font-black text-bistro-green">
              {initialStats.recipes}{' '}
              <span className="text-sm text-stone-400 font-semibold tracking-normal">Formulas</span>
            </p>
          </div>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl border-2 border-stone-100 shadow-sm">
        <h3 className="text-xl font-black text-stone-800 mb-4 tracking-tight">
          Seguridad de Cocina
        </h3>
        <p className="text-stone-500 text-sm mb-6 max-w-xl">
          Actualiza la Contraseña Maestra que todos los cocineros usarán para ingresar a las
          estaciones.
        </p>
        <form onSubmit={handleUpdatePassword} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            placeholder="Nueva contraseña maestra..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-bistro-gold"
          />
          <button
            type="submit"
            disabled={updatingPassword || !newPassword}
            className="bg-stone-900 text-white rounded-xl px-6 py-3 font-bold hover:bg-black transition-colors disabled:opacity-50"
          >
            {updatingPassword ? 'Guardando...' : 'Actualizar'}
          </button>
        </form>
        {passwordMessage.text && (
          <p
            className={`mt-3 text-sm font-bold ${passwordMessage.type === 'error' ? 'text-red-500' : 'text-bistro-green'}`}
          >
            {passwordMessage.text}
          </p>
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-stone-200">
        <CSVImporter />
      </div>
    </div>
  );
}
