import { test, expect } from '@playwright/test';

/**
 * Tests E2E: Panel Administrativo
 * Requiere storageState con sesión de admin activa (generada por auth.setup.ts)
 */

test.describe('Dashboard Admin', () => {
  test('muestra estadísticas de ingredientes y recetas', async ({ page }) => {
    await page.goto('/admin');
    // Debe mostrar los números del dashboard
    await expect(page.locator('text=Materia Prima')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Total de Recetas')).toBeVisible();
    // Los números deben ser visibles (cualquier número >= 0)
    const statsText = await page.locator('.text-3xl').allTextContents();
    expect(statsText.length).toBeGreaterThan(0);
  });

  test('navegación sidebar funciona', async ({ page }) => {
    await page.goto('/admin');
    // Navegar a ingredientes
    await page.locator('a[href="/admin/ingredients"]').first().click();
    await expect(page).toHaveURL('/admin/ingredients', { timeout: 5000 });
    // Volver a recetas
    await page.locator('a[href="/admin/recipes"]').first().click();
    await expect(page).toHaveURL('/admin/recipes', { timeout: 5000 });
  });
});

test.describe('Gestión de Ingredientes (Admin)', () => {
  test('lista de ingredientes carga sin spinner', async ({ page }) => {
    await page.goto('/admin/ingredients');
    // NO debe mostrar spinner de carga (SSR pre-cargó los datos)
    await expect(page.locator('text=Cargando...')).not.toBeVisible({ timeout: 3000 });
    // La tabla debe estar visible
    await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
  });

  test('formulario de nuevo ingrediente abre y cierra', async ({ page }) => {
    await page.goto('/admin/ingredients');
    // Click en "Nuevo Ingrediente"
    await page.locator('button', { hasText: 'Nuevo Ingrediente' }).click();
    // El modal debe aparecer
    await expect(page.locator('text=Nuevo Ingrediente').nth(1)).toBeVisible();
    // Cancelar
    await page.locator('button', { hasText: 'Cancelar' }).click();
    await expect(page.locator('text=Cancelar')).not.toBeVisible({ timeout: 2000 });
  });

  test('búsqueda filtra ingredientes en tiempo real', async ({ page }) => {
    await page.goto('/admin/ingredients');
    await expect(page.locator('table')).toBeVisible({ timeout: 5000 });
    // Escribir en el buscador
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('zzz_inexistente_xyz');
    // No debe haber resultados
    await expect(page.locator('text=No se encontraron ingredientes')).toBeVisible({
      timeout: 2000,
    });
    // Limpiar
    await searchInput.fill('');
  });
});

test.describe('Gestión de Recetas (Admin)', () => {
  test('lista de recetas carga sin spinner', async ({ page }) => {
    await page.goto('/admin/recipes');
    await expect(page.locator('text=Cargando recetas')).not.toBeVisible({ timeout: 3000 });
    // El título debe estar
    await expect(page.locator('h2', { hasText: 'Recetas' })).toBeVisible({ timeout: 5000 });
  });

  test('formulario de nueva receta abre y cierra', async ({ page }) => {
    await page.goto('/admin/recipes');
    await page.locator('button', { hasText: 'Nueva Receta' }).click();
    await expect(page.locator('text=Nueva Receta').nth(1)).toBeVisible();
    await page.locator('button', { hasText: 'Cancelar' }).click();
    await expect(page.locator('text=Cancelar')).not.toBeVisible({ timeout: 2000 });
  });
});

test.describe('API Admin - Seguridad', () => {
  test('GET /api/admin/data retorna ingredientes autenticado', async ({ request }) => {
    const res = await request.get('/api/admin/data?resource=ingredients');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /api/admin/data retorna recetas autenticado', async ({ request }) => {
    const res = await request.get('/api/admin/data?resource=recipes');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /api/admin/data retorna stats autenticado', async ({ request }) => {
    const res = await request.get('/api/admin/data?resource=stats');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.ingredients).toBe('number');
    expect(typeof body.recipes).toBe('number');
  });

  test('DELETE sin ID retorna 400', async ({ request }) => {
    const res = await request.delete('/api/admin/data?resource=recipes');
    expect(res.status()).toBe(400);
  });
});
