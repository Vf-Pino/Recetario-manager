// API Routes para que los Client Components del admin lean datos via SSR.
// El servidor tiene acceso a las cookies HttpOnly y puede autenticarse correctamente.

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sanitizePayload } from '@/lib/security';

// GET /api/admin/data?resource=ingredients|recipes|stats
export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource');
  const id = searchParams.get('id');

  // Caso especial: Estadísticas rápidas para el dashboard
  if (resource === 'stats') {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

    const [{ count: ingCount }, { count: recCount }] = await Promise.all([
      supabase.from('ingredients').select('*', { count: 'exact', head: true }),
      supabase.from('recipes').select('*', { count: 'exact', head: true }),
    ]);
    return NextResponse.json({ ingredients: ingCount ?? 0, recipes: recCount ?? 0 });
  }

  // Caso especial: Una sola receta con sus ingredientes detallados
  if (resource === 'recipes' && id) {
    const { data: recipe, error: rError } = await supabase.from('recipes').select('*').eq('id', id).single();
    if (rError) return NextResponse.json({ error: rError.message }, { status: 500 });

    const { data: ingredients, error: iError } = await supabase
      .from('recipe_ingredients')
      .select('*, ingredient:ingredients(*)')
      .eq('recipe_id', id);
    
    if (iError) return NextResponse.json({ error: iError.message }, { status: 500 });
    return NextResponse.json({ data: { ...recipe, ingredients } });
  }

  const table = resource === 'ingredients' ? 'ingredients' : resource === 'recipes' ? 'recipes' : null;
  if (!table) return NextResponse.json({ error: 'Recurso inválido' }, { status: 400 });

  const { data, error } = await supabase.from(table).select('*').order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/admin/data — crear o actualizar registros
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await request.json();
  const { resource, id } = body;
  
  // Sanitización Transparente
  const payload = sanitizePayload(body.payload);
  
  const table = resource === 'ingredients' ? 'ingredients' : resource === 'recipes' ? 'recipes' : null;
  if (!table) return NextResponse.json({ error: 'Recurso inválido' }, { status: 400 });

  // Manejamos la receta y sus ingredientes de forma conjunta si vienen en el payload
  if (table === 'recipes' && payload.ingredients) {
    const { ingredients, ...recipeData } = payload;
    
    // 1. Guardar o actualizar la receta base
    const { data: recipe, error: rError } = id 
      ? await supabase.from('recipes').update(recipeData).eq('id', id).select().single()
      : await supabase.from('recipes').insert([{ ...recipeData, is_sub_recipe: false }]).select().single();

    if (rError) return NextResponse.json({ error: rError.message }, { status: 500 });

    const recipeId = id || recipe.id;

    // 2. Sincronizar ingredientes (Delete & Insert Batch)
    // Borramos los anteriores
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);

    // Insertamos los nuevos
    if (ingredients.length > 0) {
      const { error: batchError } = await supabase.from('recipe_ingredients').insert(
        ingredients.map((ri: any) => ({
          recipe_id: recipeId,
          ingredient_id: ri.ingredient_id,
          quantity: ri.quantity
        }))
      );
      if (batchError) return NextResponse.json({ error: batchError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: recipeId });
  }

  // Comportamiento estándar para otros recursos u operaciones simples
  const query = id 
    ? supabase.from(table).update(payload).eq('id', id)
    : supabase.from(table).insert([payload]);

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === '42501' ? 403 : 500 });
  return NextResponse.json({ success: true });
}

// DELETE /api/admin/data?resource=ingredients|recipes&id=...
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource');
  const id = searchParams.get('id');
  const table = resource === 'ingredients' ? 'ingredients' : resource === 'recipes' ? 'recipes' : null;

  if (!table || !id) return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });

  // RLS blindará el borrado si no es admin.
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: error.code === '42501' ? 403 : 500 });
  return NextResponse.json({ success: true });
}

