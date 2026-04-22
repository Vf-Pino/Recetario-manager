'use client';

import { ReactNode, useState } from 'react';
import { LayoutDashboard, Beaker, FileText, ArrowLeft, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function AdminShell({ children, signOutSlot }: { children: ReactNode; signOutSlot?: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex font-sans" style={{ background: '#f5f0e8' }}>
      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`
          hidden md:flex flex-col sticky top-0 h-screen shrink-0
          bg-white border-r-2 border-[#e2d9cc]
          transition-[width] duration-300 ease-in-out overflow-hidden z-40
          ${collapsed ? 'w-[4.5rem]' : 'w-64 lg:w-72'}
        `}
      >
        {/* Logo */}
        <div className={`p-4 lg:p-5 border-b-2 border-[#f0ebe2] flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
            <Image
              src="/logo.png.jpeg"
              alt="Casa Bistró"
              width={44}
              height={44}
              className="mix-blend-multiply rounded-xl flex-shrink-0"
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-black uppercase tracking-[0.35em] leading-none text-[#6b705a]">
                  Admin
                </span>
                <span className="text-sm lg:text-base font-black uppercase tracking-tighter leading-none mt-1 text-bistro-green truncate">
                  Casa Bistró
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-2 lg:p-3 flex flex-col gap-1 overflow-y-auto">
          <SidebarLink href="/admin"             icon={<LayoutDashboard size={20} />} label="Dashboard"         collapsed={collapsed} />
          <SidebarLink href="/admin/ingredients" icon={<Beaker size={20} />}          label="Insumos / Stock"   collapsed={collapsed} />
          <SidebarLink href="/admin/recipes"     icon={<FileText size={20} />}         label="Recetario Maestro" collapsed={collapsed} />
        </nav>

        {/* Bottom actions */}
        <div className={`p-3 lg:p-4 border-t-2 border-[#f0ebe2] flex flex-col gap-2 ${collapsed ? 'items-center' : ''}`}>
          {!collapsed && (
            <>
              <Link
                href="/kitchen"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-bistro-olive hover:bg-bistro-cream hover:text-bistro-green transition-all font-black text-xs uppercase tracking-widest active:scale-95"
              >
                <ArrowLeft size={18} strokeWidth={3} /> Menú Cocina
              </Link>
              {signOutSlot}
            </>
          )}
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-stone-400 hover:bg-stone-50 hover:text-bistro-green transition-all text-xs font-black"
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <ChevronLeft
              size={16}
              strokeWidth={3}
              className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
            {!collapsed && <span className="uppercase tracking-widest text-[9px]">Colapsar</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 pb-[5.5rem] md:pb-10">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1800px] mx-auto">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t-2 border-[#e2d9cc] flex items-stretch justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <BottomNavLink href="/admin"             icon={<LayoutDashboard size={24} />} label="Panel"    />
        <BottomNavLink href="/admin/ingredients" icon={<Beaker size={24} />}          label="Insumos"  />
        <BottomNavLink href="/admin/recipes"     icon={<FileText size={24} />}         label="Recetas"  />
        <BottomNavLink href="/kitchen"           icon={<ArrowLeft size={24} />}        label="Cocina"   />
      </nav>
    </div>
  );
}

function SidebarLink({
  href, icon, label, collapsed,
}: {
  href: string; icon: ReactNode; label: string; collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`
        flex items-center gap-3 px-3 py-3 rounded-2xl
        text-bistro-olive hover:bg-bistro-cream hover:text-bistro-green
        transition-all active:scale-[0.97] border-2 border-transparent hover:border-bistro-gold/20
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <div className="bg-stone-50 p-2 rounded-xl border border-stone-100 flex-shrink-0">{icon}</div>
      {!collapsed && (
        <span className="font-black text-sm uppercase tracking-wider whitespace-nowrap">{label}</span>
      )}
    </Link>
  );
}

function BottomNavLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1 flex-1 py-3 text-bistro-olive hover:text-bistro-green active:text-bistro-green transition-colors"
    >
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest leading-none">{label}</span>
    </Link>
  );
}
