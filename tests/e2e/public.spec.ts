import { test, expect } from '@playwright/test';

/**
 * Tests E2E: Rutas Públicas
 * Verifica que la landing page y el login sean accesibles sin autenticación.
 */

test.describe('Página Principal', () => {
  test('landing page carga correctamente', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Casa Bistró|Bistro|Recetario/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('página de login es accesible', async ({ page }) => {
    await page.goto('/login');
    // El formulario de login debe existir
    await expect(page.locator('form')).toBeVisible({ timeout: 5000 });
    // Debe haber inputs de email y contraseña
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[type="text"]')).toBeVisible();
  });
});

test.describe('Protección de Rutas', () => {
  test('ruta /admin redirige a login sin sesión', async ({ page }) => {
    await page.goto('/admin');
    // Debe redirigir a login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('ruta /kitchen redirige a login sin sesión', async ({ page }) => {
    await page.goto('/kitchen');
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  test('API /api/admin/data devuelve 401 sin sesión', async ({ request }) => {
    const response = await request.get('/api/admin/data?resource=recipes');
    expect(response.status()).toBe(401);
  });

  test('API /api/admin/data devuelve 401 para recurso inválido sin sesión', async ({ request }) => {
    const response = await request.get('/api/admin/data?resource=stats');
    expect(response.status()).toBe(401);
  });
});
