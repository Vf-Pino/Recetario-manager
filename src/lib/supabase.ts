import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  throw new Error(
    `⚠️ Variable NEXT_PUBLIC_SUPABASE_URL no configurada o inválida.\n` +
      `Verifica tu archivo .env.local y reinicia el servidor.\n` +
      `Valor actual: "${supabaseUrl}"`
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    `⚠️ Variable NEXT_PUBLIC_SUPABASE_ANON_KEY no configurada.\n` +
      `Verifica tu archivo .env.local y reinicia el servidor.`
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
