'use client';

import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';

// Botón de cierre de sesión exclusivo del panel Admin.
// Al cerrarse, solo destruye la cookie del admin.
// La sesión de cocina es independiente (usuario diferente).
export default function AdminSignOutButton() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } finally {
      window.location.replace('/');
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="flex items-center gap-3 px-5 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-xs uppercase tracking-widest active:scale-95 border-2 border-transparent hover:border-red-100 disabled:opacity-50 disabled:cursor-not-allowed w-full"
    >
      {loading ? (
        <Loader2 size={18} strokeWidth={3} className="animate-spin" />
      ) : (
        <LogOut size={18} strokeWidth={3} />
      )}
      {loading ? 'Saliendo...' : 'Salir'}
    </button>
  );
}
