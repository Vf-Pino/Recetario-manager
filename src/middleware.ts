import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

import { checkRateLimit } from '@/lib/security';

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const method = request.method;
  const isApi = request.nextUrl.pathname.startsWith('/api');

  // Rate Limiting solo para API
  if (isApi) {
    const limit = method === 'GET' ? 100 : 30; // 100 req/min para lectura, 30 para escritura
    const { success } = checkRateLimit(ip, limit);

    if (!success) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Estamos protegiendo tu conexión, espera un momento',
          code: 'RATE_LIMIT_EXCEEDED'
        }),
        { 
          status: 429, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Solo ejecutar middleware en rutas de página — NO en:
     * - _next/static, _next/image (archivos estáticos)
     * - favicon.ico, imágenes, fuentes
     * - /api/* (las API routes verifican auth ellas mismas via createClient)
     *
     * Esto elimina ejecuciones innecesarias del middleware y reduce latencia.
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
};
