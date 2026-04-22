/**
 * Formatea un número como Pesos Colombianos (COP).
 * Ejemplo: formatCOP(25000) → "$ 25.000"
 * Sin decimales, separador de miles por punto.
 */
export function formatCOP(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '$ 0';
  return '$ ' + Math.round(amount).toLocaleString('es-CO');
}

/**
 * Formatea un costo unitario con hasta 4 decimales significativos.
 * Útil para costos de materia prima (ej: $ 0,0025 por gramo).
 * Ejemplo: formatCostUnit(0.0025) → "$ 0,0025"
 */
export function formatCostUnit(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '$ 0';
  if (amount === 0) return '$ 0';
  // Para valores menores a 1, mostramos hasta 4 decimales
  if (amount < 1) {
    return (
      '$ ' + amount.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 4 })
    );
  }
  // Para valores mayores o iguales a 1, sin decimales
  return '$ ' + Math.round(amount).toLocaleString('es-CO');
}

/**
 * Formatea un número como precio legible en pesos (alias de formatCOP).
 */
export const formatPrice = formatCOP;
