import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Setup global: autenticar admin y kitchen una vez.
 * Los tokens se guardan y reutilizan en todos los tests.
 * Esto evita hacer login en cada test individualmente.
 */

const adminAuthFile = 'tests/.auth/admin.json';
const kitchenAuthFile = 'tests/.auth/kitchen.json';

// Asegurar que el directorio exista
setup.beforeAll(() => {
  const dir = path.dirname(adminAuthFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

setup('autenticar admin', async ({ request }) => {
  const adminEmail = process.env.TEST_ADMIN_EMAIL;
  const adminPassword = process.env.TEST_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      '⚠️ TEST_ADMIN_EMAIL o TEST_ADMIN_PASSWORD no configurados. Saltando setup de admin.'
    );
    fs.writeFileSync(adminAuthFile, JSON.stringify({ cookies: [], origins: [] }));
    return;
  }

  const response = await request.post('/api/auth/signin', {
    data: { email: adminEmail, password: adminPassword },
  });

  if (!response.ok()) {
    throw new Error(`Login de admin falló: ${response.status()} ${await response.text()}`);
  }

  await request.storageState({ path: adminAuthFile });
});

setup('autenticar kitchen', async ({ request }) => {
  const kitchenEmail = process.env.TEST_KITCHEN_EMAIL;
  const kitchenPassword = process.env.TEST_KITCHEN_PASSWORD;

  if (!kitchenEmail || !kitchenPassword) {
    console.warn(
      '⚠️ TEST_KITCHEN_EMAIL o TEST_KITCHEN_PASSWORD no configurados. Saltando setup de kitchen.'
    );
    fs.writeFileSync(kitchenAuthFile, JSON.stringify({ cookies: [], origins: [] }));
    return;
  }

  const response = await request.post('/api/kitchen/auth', {
    data: { email: kitchenEmail, password: kitchenPassword },
  });

  if (!response.ok()) {
    throw new Error(`Login de kitchen falló: ${response.status()} ${await response.text()}`);
  }

  await request.storageState({ path: kitchenAuthFile });
});
