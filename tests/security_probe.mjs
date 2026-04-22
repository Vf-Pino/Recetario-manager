import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cgjabakgdsukvtkxlhlx.supabase.co';
const supabaseAnonKey = 'sb_publishable_bcYiVsZEoD5DAJmu8vcwZg_ZXKdjLGA';

// Simulamos que el script corre en el cliente con la Anon Key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSecurity() {
  console.log('--- TEST DE SEGURIDAD (RUTAS PÚBLICAS) ---');

  // 1. Intentar leer recetas (Debe fallar si no hay auth)
  const { data: recipes, error: rError } = await supabase.from('recipes').select('*');
  console.log('Lectura de recetas (sin auth):', rError ? 'BLOQUEADO ✅' : 'EXPUESTO ❌');

  // 2. Intentar leer ingredientes (Debe fallar si no hay auth)
  const { data: ings, error: iError } = await supabase.from('ingredients').select('*');
  console.log('Lectura de ingredientes (sin auth):', iError ? 'BLOQUEADO ✅' : 'EXPUESTO ❌');

  // 3. Intentar leer app_config (Debe fallar siempre)
  const { data: config, error: cError } = await supabase.from('app_config').select('*');
  console.log('Lectura de app_config (sin auth):', cError ? 'BLOQUEADO ✅' : 'EXPUESTO ❌');
}

testSecurity();
