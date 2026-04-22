import { Ingredient, Recipe, RecipeIngredient } from '@/types/database';

export const mockIngredients: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'Harina de Trigo 0000',
    unit: 'g',
    cost_per_unit: 0.002,
    stock: 50000,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ing-2',
    name: 'Agua Purificada',
    unit: 'ml',
    cost_per_unit: 0,
    stock: 99999,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ing-3',
    name: 'Sal Fina',
    unit: 'g',
    cost_per_unit: 0.001,
    stock: 5000,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ing-4',
    name: 'Levadura Fresca',
    unit: 'g',
    cost_per_unit: 0.01,
    stock: 1000,
    created_at: new Date().toISOString(),
  },
];

export const mockRecipes: Recipe[] = [
  {
    id: 'rec-1',
    name: 'Masa de Pizza Napolitana Clásica',
    description:
      'Fermentación en bloque a temperatura controlada de 24 horas y maduración de bollos en frío de 48 horas.',
    category: 'Masa',
    yield_amount: 10,
    yield_unit: 'bollos (250g)',
    bakers_percentage_base_ingredient_id: 'ing-1',
    procedure_text:
      '1. Disolver la levadura en el agua.\n2. Incorporar poco a poco el 50% de la harina mientras se oxigena.\n3. Añadir la sal y el resto de la harina amasando suavemente.\n4. Amasar 15 minutos hasta tener una masa lisa.\n5. Descansar 1 hora a temperatura ambiente (pliegues de tensión cada 20min).\n6. Formar los bollos y guardar en frío.',
    created_at: new Date().toISOString(),
  },
];

export const mockRecipeIngredients: RecipeIngredient[] = [
  {
    id: 'ri-1',
    recipe_id: 'rec-1',
    ingredient_id: 'ing-1',
    sub_recipe_id: null,
    quantity: 1530,
    is_bakers_percentage_base: true,
    bakers_percentage: 100,
    created_at: new Date().toISOString(),
    ingredient: mockIngredients[0],
  },
  {
    id: 'ri-2',
    recipe_id: 'rec-1',
    ingredient_id: 'ing-2',
    sub_recipe_id: null,
    quantity: 995,
    is_bakers_percentage_base: false,
    bakers_percentage: 65,
    created_at: new Date().toISOString(),
    ingredient: mockIngredients[1],
  },
  {
    id: 'ri-3',
    recipe_id: 'rec-1',
    ingredient_id: 'ing-3',
    sub_recipe_id: null,
    quantity: 45.9,
    is_bakers_percentage_base: false,
    bakers_percentage: 3,
    created_at: new Date().toISOString(),
    ingredient: mockIngredients[2],
  },
  {
    id: 'ri-4',
    recipe_id: 'rec-1',
    ingredient_id: 'ing-4',
    sub_recipe_id: null,
    quantity: 3.06,
    is_bakers_percentage_base: false,
    bakers_percentage: 0.2,
    created_at: new Date().toISOString(),
    ingredient: mockIngredients[3],
  },
];
