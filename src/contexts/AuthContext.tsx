'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Obtener la sesión actual al cargar
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    };

    fetchSession();

    // 2. Suscribirse a cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    // Aislamiento de responsabilidad:
    // AuthContext solo LEE el perfil.
    // La creación y asignación de roles (admin/kitchen) se maneja en el servidor
    // vía API routes y Middleware de Next.js por seguridad.
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (data) {
      setProfile(data as Profile);
    }

    setIsLoading(false);
  };

  const signOut = async () => {
    try {
      // Limpiar estado local inmediatamente (UX responsivo)
      setUser(null);
      setProfile(null);

      // Llamar al servidor para destruir la cookie HttpOnly (operación crítica)
      // Esta es la ÚNICA fuente de verdad. Si falla, usamos el cliente como fallback.
      const serverSignOut = fetch('/api/auth/signout', { method: 'POST' });
      const clientSignOut = supabase.auth.signOut();

      // Ejecutar ambos en paralelo para máxima velocidad
      await Promise.allSettled([serverSignOut, clientSignOut]);
    } catch {
      // En cualquier caso de error, forzamos la destrucción de sesión en cliente
      await supabase.auth.signOut().catch(() => {});
    } finally {
      // Redirección GARANTIZADA sin importar el resultado de las promesas anteriores
      window.location.replace('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
