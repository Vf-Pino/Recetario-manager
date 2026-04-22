import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright - Pruebas E2E para Casa Bistró
 * Cubre: Login Admin, Login Kitchen, Navigación, Rutas protegidas
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'tests/reports/html' }], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    // Configuración de estado de autenticación (setup reusable)
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Tests del Admin (requieren login previo)
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/admin.json',
      },
      dependencies: ['setup'],
      testMatch: /.*admin.*\.spec\.ts/,
    },
    // Tests de Kitchen (requieren login previo)
    {
      name: 'kitchen',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/kitchen.json',
      },
      dependencies: ['setup'],
      testMatch: /.*kitchen.*\.spec\.ts/,
    },
    // Tests públicos (sin auth)
    {
      name: 'public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*public.*\.spec\.ts/,
    },
    // Tests móvil
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      testMatch: /.*mobile.*\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
