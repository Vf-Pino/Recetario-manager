'use client';

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChefHat,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import Watermark from '@/components/kitchen/Watermark';
import { useSearchParams } from 'next/navigation';

// ── Utilidades de memoria local ──────────────────────────────────────────────
const STORAGE_KEY = 'casabistro_recent_emails';

function getSavedEmails(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEmail(email: string) {
  try {
    const existing = getSavedEmails();
    // Poner el email más reciente al principio, sin duplicados
    const updated = [email, ...existing.filter((e) => e !== email)].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Si localStorage no está disponible, continuar sin error
  }
}

// ── Componente EmailInput con sugerencias ────────────────────────────────────
function EmailInput({
  value,
  onChange,
  disabled,
  id,
  name,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  id?: string;
  name?: string;
}) {
  const [allSaved] = useState<string[]>(() => getSavedEmails());
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Pre-llenar si hay guardados al montar (solo una vez)
  useEffect(() => {
    if (allSaved.length > 0 && !value) {
      onChange(allSaved[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calcular sugerencias reactivamente
  const suggestions = useMemo(
    () =>
      !value || value.length < 1
        ? allSaved
        : allSaved.filter((e) => e.toLowerCase().includes(value.toLowerCase()) && e !== value),
    [value, allSaved]
  );

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (email: string) => {
    onChange(email);
    setShowDropdown(false);
    // Dar foco al campo de contraseña automáticamente
    setTimeout(() => {
      const passwordInput = document.getElementById('bistro_password') as HTMLInputElement;
      passwordInput?.focus();
    }, 50);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 z-10">
        <Mail size={20} strokeWidth={3} />
      </div>
      <input
        ref={inputRef}
        id={id || 'email'}
        name={name || 'email'}
        type="email"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder="usuario@casabistro.com"
        required
        autoComplete="off"
        disabled={disabled}
        className="w-full pl-12 pr-4 py-4 bg-stone-50 border-2 border-stone-200 rounded-xl font-bold text-lg text-stone-700 focus:border-bistro-gold focus:ring-0 outline-none transition-all disabled:opacity-50"
      />

      {/* Dropdown de sugerencias */}
      {showDropdown && suggestions.length > 0 && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-stone-200 rounded-xl shadow-lg overflow-hidden z-50"
        >
          {suggestions.map((email) => (
            <button
              key={email}
              type="button"
              onClick={() => handleSelect(email)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 group-hover:bg-bistro-gold/10 transition-colors">
                <Clock
                  size={13}
                  className="text-stone-400 group-hover:text-bistro-gold"
                  strokeWidth={2.5}
                />
              </div>
              <span className="font-semibold text-stone-700 text-sm truncate">{email}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Formulario de Login ────────────────────────────────────────────────────
function LoginForm() {
  const searchParams = useSearchParams();
  const searchMode = searchParams.get('mode') as 'kitchen' | 'admin' | null;

  const [mode, setMode] = useState<'kitchen' | 'admin'>('kitchen');

  useEffect(() => {
    if (searchMode === 'kitchen' || searchMode === 'admin') {
      setMode(searchMode);
    }
  }, [searchMode]);

  // Limpiar campos al montar el componente para evitar basura de sesiones previas
  useEffect(() => {
    setEmail('');
    setPassword('');
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      if (mode === 'kitchen') {
        // Kitchen: valida la contraseña maestra Y hace signIn SSR en una sola llamada
        const res = await fetch('/api/kitchen/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Contraseña incorrecta');

        saveEmail(email);
        setStatus('success');
        window.location.href = '/kitchen';
      } else {
        // Admin: signIn SSR con sus credenciales únicas
        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.error?.toLowerCase().includes('invalid') ||
              data.error?.toLowerCase().includes('credentials')
              ? 'Credenciales de administrador incorrectas'
              : data.error || 'Error al iniciar sesión'
          );
        }

        saveEmail(email);
        setStatus('success');
        window.location.href = '/admin';
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Ocurrió un error inesperado');
      setStatus('error');
    }
  };

  const isDisabled = status === 'loading' || status === 'success';

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <Watermark />

      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border-4 border-bistro-gold/10 p-8 sm:p-12 z-10 relative flex flex-col items-center">
        <Link href="/" className="mb-8">
          <Image
            src="/logo.png.jpeg"
            alt="Casa Bistró Logo"
            width={120}
            height={120}
            priority
            className="mix-blend-multiply opacity-90 mx-auto"
          />
        </Link>

        {/* Toggle Login Mode */}
        <div className="flex bg-stone-100 p-1 rounded-xl mb-8 w-full max-w-[280px]">
          <button
            onClick={() => {
              setMode('kitchen');
              setErrorMessage('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold text-sm transition-all ${mode === 'kitchen' ? 'bg-white shadow text-bistro-green' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <ChefHat size={16} /> Cocina
          </button>
          <button
            onClick={() => {
              setMode('admin');
              setErrorMessage('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-bold text-sm transition-all ${mode === 'admin' ? 'bg-white shadow text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
          >
            <ShieldCheck size={16} /> Admin
          </button>
        </div>

        <div className="text-center mb-8 w-full">
          <h1 className="text-3xl font-black text-stone-900 uppercase tracking-tight">Acceso</h1>
          <p className="text-stone-400 font-bold mt-2 uppercase tracking-widest text-xs">
            {mode === 'kitchen' ? 'Estación de Trabajo' : 'Centro de Comando'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-5" autoComplete="off">
          {/* Honeypot fields to trap browser autofill */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input type="email" name="fake_email" tabIndex={-1} aria-hidden="true" />
            <input type="password" name="fake_password" tabIndex={-1} aria-hidden="true" />
          </div>
          {/* Campo de correo con sugerencias */}
          <div className="space-y-2">
            <label
              htmlFor="bistro_email"
              className="text-xs font-black uppercase tracking-widest text-stone-500 ml-2"
            >
              Correo
            </label>
            <EmailInput
              value={email}
              onChange={setEmail}
              disabled={isDisabled}
              id="bistro_email"
              name="bistro_email"
            />
          </div>

          {/* Campo de contraseña - NUNCA se recuerda */}
          <div className="space-y-2">
            <label
              htmlFor="bistro_password"
              className="text-xs font-black uppercase tracking-widest text-stone-500 ml-2"
            >
              {mode === 'kitchen' ? 'Contraseña Maestra' : 'Contraseña Admin'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                <Lock size={20} strokeWidth={3} />
              </div>
              <input
                id="bistro_password"
                name="bistro_password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                disabled={isDisabled}
                className="w-full pl-12 pr-4 py-4 bg-stone-50 border-2 border-stone-200 rounded-xl font-bold text-lg text-stone-700 focus:border-bistro-gold focus:ring-0 outline-none transition-all disabled:opacity-50 tracking-widest font-mono"
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-bold border border-red-200">
              <AlertTriangle size={16} className="shrink-0" />
              {errorMessage}
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-bistro-green bg-bistro-green/10 p-3 rounded-lg text-sm font-bold border border-bistro-green/20">
              <CheckCircle2 size={16} className="shrink-0" />
              Sesión iniciada correctamente. Ingresando...
            </div>
          )}

          <button
            type="submit"
            disabled={isDisabled}
            className="w-full mt-2 bg-stone-900 text-white font-black text-lg p-4 rounded-xl flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-lg border-b-4 border-black/20 disabled:opacity-70 disabled:active:scale-100"
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verificando...
              </span>
            ) : (
              <>
                Ingresar <ArrowRight size={24} strokeWidth={3} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-100 flex items-center justify-center font-sans tracking-widest text-sm font-bold uppercase text-stone-400">
          <div className="animate-pulse">Cargando...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
