'use client';

import { LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface KitchenHeaderProps {
  showSearch?: boolean;
  searchTerm?: string;
  setSearchTerm?: (val: string) => void;
}

export default function KitchenHeader({
  showSearch,
  searchTerm,
  setSearchTerm,
}: KitchenHeaderProps) {
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  // Ref para bloquear llamadas múltiples incluso si el estado no actualiza a tiempo
  const isCalling = useRef(false);

  const handleCloseStation = async () => {
    // Bloqueo de doble/triple click usando ref (más rápido que estado)
    if (isCalling.current || isSigningOut) return;
    isCalling.current = true;
    setIsSigningOut(true);

    try {
      // Delegar TODO al AuthContext que ya tiene la lógica robusta con Promise.allSettled
      await signOut();
    } catch {
      // signOut ya maneja sus propios errores internamente
      // Si algo explota aquí, forzamos redirección como último recurso
      window.location.replace('/');
    }
  };

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-md shadow-sm border-b"
      style={{ background: 'rgba(245,240,232,0.95)', borderColor: '#e2d9cc' }}
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-8 h-24 flex items-center justify-between gap-6">
        {/* Left: Branding */}
        <div className="flex items-center gap-5">
          <Link href="/kitchen" className="hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png.jpeg"
              alt="Casa Bistró"
              width={72}
              height={72}
              className="mix-blend-multiply opacity-95"
            />
          </Link>
          <div className="hidden sm:flex flex-col">
            <span className="text-[12px] font-black uppercase tracking-[0.4em] leading-none text-[#6b705a]">
              Casa
            </span>
            <span className="text-[12px] font-black uppercase tracking-[0.4em] leading-none mt-1 text-[#6b705a]">
              Bistró
            </span>
          </div>
        </div>

        {/* Center: Search (if enabled) */}
        {showSearch && setSearchTerm && (
          <div className="flex-1 max-w-sm relative hidden md:block">
            <input
              type="text"
              placeholder="Buscar receta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-5 pr-12 py-3 bg-[#ede8df] border-2 border-[#ddd5c4] rounded-2xl font-bold text-[#3b5442] outline-none focus:border-[#e7be86] transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a89e8a]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
          </div>
        )}

        {/* Right: Close Station */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCloseStation}
            disabled={isSigningOut}
            className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 px-4 py-2 sm:px-5 sm:py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[.2em] border-2 border-red-100 hover:border-red-200 transition-all shadow-sm active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            title="Cerrar Estación"
          >
            {isSigningOut ? (
              <svg
                className="animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : (
              <LogOut size={16} strokeWidth={3} className="sm:hidden lg:block" />
            )}
            <span className="hidden sm:inline">
              {isSigningOut ? 'Cerrando...' : 'Cerrar Estación'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && setSearchTerm && (
        <div className="md:hidden px-5 pb-4">
          <input
            type="text"
            placeholder="Buscar receta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 bg-[#ede8df] border-2 border-[#ddd5c4] rounded-2xl font-bold text-[#3b5442] outline-none focus:border-[#e7be86] transition-all"
          />
        </div>
      )}
    </header>
  );
}
