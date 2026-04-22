export type UserRole = 'admin' | 'kitchen_staff' | 'pending';

export interface AppConfig {
  key: string;
  value: string;
  updated_at: string;
}

export interface Profile {
  id: string; // Relacionado al User de Supabase Auth
  email: string;
  role: UserRole;
  created_at: string;
}

export type UnitType = 'g' | 'ml' | 'unit';

export interface Ingredient {
  id: string;
  name: string;
  unit: UnitType;
  cost_per_unit: number;
  stock: number;
  created_at: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  procedure_text: string | null;
  yield_amount: number;
  yield_unit: string;
  bakers_percentage_base_ingredient_id: string | null;
  created_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string | null;
  sub_recipe_id: string | null;
  quantity: number;
  is_bakers_percentage_base: boolean;
  bakers_percentage: number | null;
  created_at: string;
  // Campos relacionales opcionales al hacer un JOIN ('fetch' con Supabase)
  ingredient?: Ingredient;
  sub_recipe?: Recipe;
}

export type ModifierType = 'add' | 'remove' | 'replace';

export interface AdditionalModifier {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  name: string;
  type: ModifierType;
  quantity_change: number;
  created_at: string;
  // Campos relacionales opcionales al hacer un JOIN
  ingredient?: Ingredient;
}
