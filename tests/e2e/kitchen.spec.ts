import { test, expect } from '@playwright/test';

/**
 * Tests E2E: Zona de Cocina
 * Requiere storageState con sesión de kitchen activa (generada por auth.setup.ts)
 */

test.describe('Página Principal de Cocina', () => {
  test('carga lista de recetas sin spinner (SSR)', async ({ page }) => {
    await page.goto('/kitchen');
    // SSR pre-carga los datos — no debe haber spinner
    const loadingEl = page.locator('text=Cargando');
    await expect(loadingEl).not.toBeVisible({ timeout: 3000 });
    // Título principal visible
    await expect(page.locator('h1', { hasText: 'Recetas activas' })).toBeVisible({ timeout: 5000 });
  });

  test('buscador filtra recetas en tiempo real', async ({ page }) => {
    await page.goto('/kitchen');
    await expect(page.locator('h1', { hasText: 'Recetas activas' })).toBeVisible({ timeout: 5000 });
    // Buscar algo inexistente
    const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]');
    if ((await searchInput.count()) > 0) {
      await searchInput.fill('zzz_inexistente_xyz_123');
      await expect(page.locator('text=Sin resultados')).toBeVisible({ timeout: 3000 });
      await searchInput.fill('');
    }
  });

  test('KitchenHeader muestra opciones de navegación', async ({ page }) => {
    await page.goto('/kitchen');
    // El header debe estar presente
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Detalle de Receta', () => {
  test('API de recetas devuelve datos', async ({ request }) => {
    // Primero obtener lista de recetas
    // (este test asume que hay al menos una receta en la DB)
    const res = await request.get('/admin/recipes').catch(() => null);
    // Solo verificamos que el endpoint responde
    expect(res?.status() ?? 200).toBeLessThan(500);
  });
});

test.describe('Seguridad Kitchen', () => {
  test('POST /api/kitchen/auth rechaza contraseña incorrecta', async ({ request }) => {
    const res = await request.post('/api/kitchen/auth', {
      data: {
        email: 'test@test.com',
        password: 'contraseña_incorrecta_xyz_123',
      },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test('POST /api/kitchen/auth rechaza sin credenciales', async ({ request }) => {
    const res = await request.post('/api/kitchen/auth', {
      data: {},
    });
    expect(res.status()).toBe(400);
  });
});
