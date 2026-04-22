/**
 * Casa Bistró - Motor de Seguridad y Sanitización v1.1
 * Diseñado para proteger la integridad de los datos sin afectar la sique de gastronomía (acentos, ñ, símbolos).
 */

/**
 * sanitiza un string eliminando etiquetas HTML peligrosas e inyecciones de script.
 * Preserva caracteres UTF-8 (acentos, ñ, símbolos culinarios).
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text
    // 1. Eliminar etiquetas de script y su contenido
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
    // 2. Eliminar handlers de eventos (onmouseover, onclick, etc)
    .replace(/on\w+="[^"]*"/gim, '')
    .replace(/on\w+='[^']*'/gim, '')
    // 3. Eliminar etiquetas HTML peligrosas pero permitir texto plano
    // No usamos una librería pesada para mantener la "libertad" y velocidad
    .replace(/<[^>]*>?/gm, '')
    // 4. Recortar espacios innecesarios
    .trim();
}

/**
 * Sanitiza un objeto de forma recursiva (solo para campos de texto)
 */
export function sanitizePayload<T>(payload: T): T {
  if (!payload || typeof payload !== 'object') return payload;

  const sanitized = Array.isArray(payload) ? [] : {} as any;

  for (const key in payload) {
    const value = payload[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizePayload(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Rate Limiting Memory Store
 * Un contador simple para el middleware.
 */
const ipRequests = new Map<string, { count: number; lastReset: number }>();

export function checkRateLimit(ip: string, limit: number, windowMs: number = 60000): { success: boolean; remaining: number } {
  const now = Date.now();
  const userData = ipRequests.get(ip) || { count: 0, lastReset: now };

  // Si pasó el tiempo de la ventana, reseteamos
  if (now - userData.lastReset > windowMs) {
    userData.count = 1;
    userData.lastReset = now;
  } else {
    userData.count++;
  }

  ipRequests.set(ip, userData);

  return {
    success: userData.count <= limit,
    remaining: Math.max(0, limit - userData.count)
  };
}
