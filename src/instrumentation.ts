/**
 * Instrumentación global de Sentry para Next.js
 * Se ejecuta una sola vez al arrancar el servidor.
 *
 * IMPORTANTE: Requiere NEXT_PUBLIC_SENTRY_DSN en .env.local
 * Obtenerlo en: https://sentry.io → Settings → Projects → DSN
 */
export async function register() {
  // Solo inicializar si hay DSN configurado (no romper si no está)
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sentry] NEXT_PUBLIC_SENTRY_DSN no configurado. Monitoreo desactivado.');
    }
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Ignorar errores de red esperados
      ignoreErrors: ['NEXT_REDIRECT', 'NEXT_NOT_FOUND'],
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
    });
  }
}
