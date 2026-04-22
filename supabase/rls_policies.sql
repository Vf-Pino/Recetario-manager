-- -------------------------------------------------------------
-- SCRIPT DE BLINDAJE TÉCNICO RLS v1.1: CASA BISTRÓ (PRODUCCIÓN)
-- -------------------------------------------------------------

-- 1. Función de Seguridad (Rompe-Recursión)
-- Al ser 'SECURITY DEFINER', se ejecuta con privilegios de sistema, bypass RLS internos.
CREATE OR REPLACE FUNCTION check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (role = 'admin')
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Habilitar RLS en tablas (Asegurar que esté activo)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- 3. Limpiar políticas previas para evitar duplicidad o conflictos
DROP POLICY IF EXISTS "Usuarios leen su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins leen todos los perfiles" ON profiles;
DROP POLICY IF EXISTS "Lectura de perfil propio" ON profiles;
DROP POLICY IF EXISTS "Admins leen todo" ON profiles;

DROP POLICY IF EXISTS "Personal autenticado lee recetas" ON recipes;
DROP POLICY IF EXISTS "Solo admins gestionan recetas" ON recipes;
DROP POLICY IF EXISTS "Personal autenticado lee ingredientes" ON ingredients;
DROP POLICY IF EXISTS "Solo admins gestionan ingredientes" ON ingredients;

-- 4. POLÍTICAS PARA 'PROFILES'
-- Un usuario puede leer su propio perfil
CREATE POLICY "Lectura de perfil propio" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Los administradores pueden leer todos los perfiles (vía función de seguridad)
CREATE POLICY "Admins leen todo" ON profiles
    FOR SELECT USING (check_is_admin());

-- 5. POLÍTICAS PARA 'RECIPES'
-- Todo el personal autenticado (cocina + admin) puede ver las recetas
CREATE POLICY "Personal autenticado lee recetas" ON recipes
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Solo administradores pueden Crear, Editar o Borrar recetas
CREATE POLICY "Solo admins gestionan recetas" ON recipes
    FOR ALL USING (check_is_admin());

-- 6. POLÍTICAS PARA 'INGREDIENTS'
-- Todo el personal autenticado puede ver los insumos
CREATE POLICY "Personal autenticado lee ingredientes" ON ingredients
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Solo administradores pueden Crear, Editar o Borrar ingredientes
CREATE POLICY "Solo admins gestionan ingredientes" ON ingredients
    FOR ALL USING (check_is_admin());

-- 7. POLÍTICAS PARA 'APP_CONFIG' (Zero-Trust)
-- Por defecto, sin políticas de SELECT/UPDATE, nadie (ni siquiera autenticados) puede leerla.
-- Solo el SERVICE_ROLE podrá acceder a la Master Password desde el servidor.

-- 8. NOTA FINAL
-- Con estas políticas v1.1, se elimina el error de "infinite recursion" y se garantiza
-- que el personal de cocina solo tenga acceso de LECTURA.
