import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Casa Bistró | Recetario Maestro',
  description: 'Sistema Inteligente de Gestión Operativa y Control de Fórmulas Técnicas',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png.jpeg',
    apple: '/logo.png.jpeg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-neutral-50 text-neutral-900`}
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
