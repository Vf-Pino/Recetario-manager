'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function Watermark() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden opacity-[0.035] flex flex-wrap justify-center content-center select-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <span
          key={i}
          className="text-2xl sm:text-3xl font-black p-4 sm:p-8 transform -rotate-45 text-black whitespace-nowrap"
        >
          {profile.email} - PROP. INTELECTUAL
        </span>
      ))}
    </div>
  );
}
