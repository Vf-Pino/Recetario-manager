'use client';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, ChefHat, MoveRight } from 'lucide-react';

export default function Home() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 select-none"
      style={{ background: '#f5f0e8' }}
    >
      {/* Fine horizontal rule accent top */}
      <div
        className="fixed top-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, transparent, #e7be86, transparent)' }}
      />

      <div className="w-full max-w-sm flex flex-col items-center gap-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo.png.jpeg"
            alt="Casa Bistró"
            width={120}
            height={120}
            priority
            className="mix-blend-multiply opacity-90 transition-all duration-700 hover:scale-110"
          />
          <div className="text-center">
            <h1
              className="text-[14px] font-black uppercase tracking-[0.4em]"
              style={{ color: '#6b705a' }}
            >
              Casa Bistró
            </h1>
            <p
              className="text-[10px] uppercase tracking-[0.22em] mt-0.5"
              style={{ color: '#b0a890' }}
            >
              Recetario Digital
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: '#ddd5c4' }} />
          <span
            className="text-[9px] font-black uppercase tracking-[0.3em]"
            style={{ color: '#c4b99a' }}
          >
            Acceso
          </span>
          <div className="flex-1 h-px" style={{ background: '#ddd5c4' }} />
        </div>

        {/* Navigation cards */}
        <div className="w-full flex flex-col gap-3">
          {/* Cocina */}
          <Link
            href="/kitchen"
            className="w-full group flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-200 hover:shadow-lg active:scale-[0.99]"
            style={{
              background: '#3b5442',
              border: '1px solid #2e4234',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(231,190,134,0.15)' }}
              >
                <ChefHat size={18} strokeWidth={2} style={{ color: '#e7be86' }} />
              </div>
              <div>
                <p className="font-black text-white text-base leading-tight">Cocina</p>
                <p
                  className="text-[10px] uppercase tracking-widest mt-0.5"
                  style={{ color: 'rgba(231,190,134,0.6)' }}
                >
                  Estación activa
                </p>
              </div>
            </div>
            <MoveRight
              size={16}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:translate-x-1"
              style={{ color: 'rgba(231,190,134,0.5)' }}
            />
          </Link>

          {/* Administración */}
          <Link
            href="/admin"
            className="w-full group flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-200 hover:shadow-md active:scale-[0.99]"
            style={{
              background: '#ffffff',
              border: '1px solid #e2d9cc',
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: '#f0ebe2' }}
              >
                <LayoutDashboard size={18} strokeWidth={2} style={{ color: '#3b5442' }} />
              </div>
              <div>
                <p className="font-black text-base leading-tight" style={{ color: '#3b5442' }}>
                  Gestión
                </p>
                <p
                  className="text-[10px] uppercase tracking-widest mt-0.5"
                  style={{ color: '#a89e8a' }}
                >
                  Admin & costos
                </p>
              </div>
            </div>
            <MoveRight
              size={16}
              strokeWidth={2}
              className="transition-transform duration-200 group-hover:translate-x-1"
              style={{ color: '#c4b99a' }}
            />
          </Link>
        </div>

        {/* Footer label */}
        <p className="text-[9px] uppercase tracking-[0.35em]" style={{ color: '#c4b99a' }}>
          Sistema Interno · v2
        </p>
      </div>
    </main>
  );
}
