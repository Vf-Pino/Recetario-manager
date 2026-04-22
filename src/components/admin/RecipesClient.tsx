'use client';
import { useState, useCallback, useEffect } from 'react';
import { Recipe, RecipeIngredient, Ingredient } from '@/types/database';
import { Plus, ChevronRight, Trash2, X, Check, Loader2, Pencil, Scale, Utensils, Info } from 'lucide-react';
import SmartQuantityInput from '@/components/common/SmartQuantityInput';
import IngredientSelector from '@/components/admin/IngredientSelector';

const API = '/api/admin/data';

interface Props {
  initialData: Recipe[];
}

export default function RecipesClient({ initialData }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialData);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    yield_amount: '',
    yield_unit: 'g',
    procedure_text: '',
  });

  const [recipeIngredients, setRecipeIngredients] = useState<Partial<RecipeIngredient>[]>([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      const res = await fetch(`${API}?resource=ingredients`);
      const { data } = await res.json();
      if (data) setAllIngredients(data);
    };
    fetchIngredients();
  }, []);

  useEffect(() => {
    const total = recipeIngredients.reduce((sum, ri) => sum + (ri.quantity || 0), 0);
    if (total > 0 && !editingId) {
      setForm(prev => ({ ...prev, yield_amount: total.toString() }));
    }
  }, [recipeIngredients, editingId]);

  const refetch = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API}?resource=recipes`);
      const { data } = await res.json();
      if (data) setRecipes(data);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.yield_amount) {
      alert('Nombre y Rendimiento son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category || null,
        description: form.description || null,
        yield_amount: parseFloat(form.yield_amount),
        yield_unit: form.yield_unit,
        procedure_text: form.procedure_text || null,
        ingredients: recipeIngredients.map(ri => ({
          ingredient_id: ri.ingredient_id,
          quantity: ri.quantity
        }))
      };

      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: 'recipes', payload, id: editingId }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        alert(`Error: ${data.error}`);
        return;
      }
      
      handleClose();
      refetch();
    } catch (e: unknown) {
      const error = e as Error;
      alert(`Error inesperado: ${error?.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la receta "${name}"?`)) return;
    await fetch(`${API}?resource=recipes&id=${id}`, { method: 'DELETE' });
    refetch();
  };

  const handleEdit = async (recipe: Recipe) => {
    setEditingId(recipe.id);
    setLoadingDetails(true);
    setShowForm(true);
    
    setForm({
      name: recipe.name,
      category: recipe.category || '',
      description: recipe.description || '',
      yield_amount: recipe.yield_amount.toString(),
      yield_unit: recipe.yield_unit,
      procedure_text: recipe.procedure_text || '',
    });

    try {
      const res = await fetch(`${API}?resource=recipes&id=${recipe.id}`);
      const { data } = await res.json();
      if (data?.ingredients) {
        setRecipeIngredients(data.ingredients);
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleClose = () => {
    setForm({
      name: '',
      category: '',
      description: '',
      yield_amount: '',
      yield_unit: 'g',
      procedure_text: '',
    });
    setRecipeIngredients([]);
    setEditingId(null);
    setShowForm(false);
  };

  const addIngredientToRecipe = (ing: Ingredient) => {
    if (recipeIngredients.some(ri => ri.ingredient_id === ing.id)) return;
    setRecipeIngredients([
      ...recipeIngredients,
      {
        ingredient_id: ing.id,
        quantity: 0,
        ingredient: ing
      }
    ]);
  };

  const updateIngredientQty = (id: string, qty: number) => {
    setRecipeIngredients(prev => 
      prev.map(ri => ri.ingredient_id === id ? { ...ri, quantity: qty } : ri)
    );
  };

  const removeIngredient = (id: string) => {
    setRecipeIngredients(prev => prev.filter(ri => ri.ingredient_id !== id));
  };

  const calculateSum = () => {
    return recipeIngredients.reduce((sum, ri) => sum + (ri.quantity || 0), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="text-2xl font-black text-bistro-green">Recetas</h2>
          <p className="text-stone-500 font-medium mt-1 text-sm">
            Editor de fórmulas técnicas y procesos de producción.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isRefreshing && <Loader2 size={18} className="animate-spin text-stone-400" />}
          <button
            onClick={() => {
              setEditingId(null);
              setShowForm(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-bistro-green hover:bg-black text-white px-5 py-2.5 rounded-xl transition-all font-bold shadow-sm active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> Nueva Receta
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-end md:items-center justify-center md:p-6 overflow-hidden backdrop-blur-md">
          <div className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl w-full md:max-w-3xl lg:max-w-5xl h-[92dvh] md:h-[90vh] relative overflow-hidden flex flex-col">
            {loadingDetails && (
              <div className="absolute inset-0 bg-white/90 z-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-bistro-gold" size={48} />
              </div>
            )}
            
            {/* Header Compacto */}
            <header className="p-6 sm:px-10 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl text-bistro-gold shadow-sm border border-stone-100">
                  <Utensils size={20} />
                </div>
                <div>
                  <h3 className="font-black text-bistro-green text-xl tracking-tight leading-none">
                    {editingId ? 'Editor de Fórmula Técnica' : 'Nueva Receta Maestra'}
                  </h3>
                  <p className="text-[10px] uppercase font-black tracking-widest text-stone-400 mt-1">
                    Gestión Relacional de Insumos v1.1
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className="text-stone-400 hover:text-stone-900 bg-white p-2 rounded-full transition-colors border border-stone-100 shadow-sm">
                <X size={20} />
              </button>
            </header>

            {/* Cuerpo del Editor */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
                
                {/* Columna Izquierda: Configuración Base (Stack on Mobile) */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-stone-400 mb-2">
                       <Info size={14} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Información General</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Nombre de la Receta..."
                          className="w-full text-xl sm:text-2xl font-black text-bistro-green placeholder:text-stone-200 bg-transparent outline-none border-b-2 border-stone-100 focus:border-bistro-gold transition-all pb-2"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Categoría</label>
                          <input
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            placeholder="Ej: Panadería"
                            className="w-full border border-stone-200 rounded-lg px-4 py-2 text-base font-bold bg-stone-50/50 outline-none focus:bg-white focus:border-bistro-gold transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Rendimiento</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              inputMode="decimal"
                              value={form.yield_amount}
                              onChange={(e) => setForm({ ...form, yield_amount: e.target.value })}
                              className="w-full border border-stone-200 rounded-lg px-4 py-2 text-base font-black bg-stone-50/50 outline-none focus:bg-white focus:border-bistro-gold transition-all text-bistro-green"
                            />
                            <select
                              value={form.yield_unit}
                              onChange={(e) => setForm({ ...form, yield_unit: e.target.value })}
                              className="border border-stone-200 rounded-lg px-2 text-base font-black bg-stone-50/50 outline-none"
                            >
                              <option value="g">G</option>
                              <option value="ml">ML</option>
                              <option value="unit">UN</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-stone-400">
                       <Scale size={14} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Descripción General</span>
                    </div>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Notas del chef, historia o perfil de sabor..."
                      className="w-full border border-stone-200 rounded-2xl px-5 py-4 font-medium text-sm bg-stone-50/50 outline-none focus:bg-white focus:border-bistro-gold transition-all resize-none h-24 leading-relaxed"
                    />
                  </section>

                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-stone-400">
                       <Pencil size={14} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Proceso de Elaboración</span>
                    </div>
                    <textarea
                      value={form.procedure_text}
                      onChange={(e) => setForm({ ...form, procedure_text: e.target.value })}
                      placeholder="Describe paso a paso la preparación..."
                      className="w-full border border-stone-200 rounded-2xl px-5 py-4 font-medium text-sm bg-stone-50/50 outline-none focus:bg-white focus:border-bistro-gold transition-all resize-none h-48 sm:h-64 leading-relaxed scrollbar-thin"
                    />
                  </section>
                </div>

                {/* Columna Derecha: Fórmula Técnica (Full width on mobile) */}
                <div className="lg:col-span-3 flex flex-col bg-stone-50 rounded-[1.5rem] sm:rounded-[2rem] border border-stone-200/60 overflow-hidden min-h-[400px]">
                  <header className="p-4 sm:p-6 border-b border-stone-200/60 bg-white/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Scale size={18} className="text-bistro-gold" />
                      <h4 className="font-black text-stone-700 uppercase tracking-widest text-xs">Hoja de Insumos</h4>
                    </div>
                    <div className="w-full sm:w-auto">
                      <IngredientSelector 
                        availableIngredients={allIngredients} 
                        onSelect={addIngredientToRecipe} 
                      />
                    </div>
                  </header>

                  <div className="flex-1 overflow-y-auto scrollbar-thin bg-white/30">
                    {/* Vista Desktop: Tabla */}
                    <table className="hidden sm:table w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-stone-100/90 backdrop-blur-sm z-10">
                        <tr>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-tighter text-stone-400 w-[50%]">Insumo</th>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-tighter text-stone-400 text-center w-[35%]">Cantidad</th>
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-tighter text-stone-400 text-right w-[15%] pr-8">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {recipeIngredients.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-20 text-center opacity-30">
                              <Scale size={32} className="mx-auto mb-2" />
                              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Fórmula Vacía</p>
                            </td>
                          </tr>
                        ) : (
                          recipeIngredients.map((ri) => (
                            <tr key={ri.ingredient_id} className="group hover:bg-stone-50/80 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-black text-bistro-green text-sm">{ri.ingredient?.name}</span>
                                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{ri.ingredient?.unit}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 w-64">
                                 <SmartQuantityInput
                                  value={ri.quantity || 0}
                                  onChange={(val) => updateIngredientQty(ri.ingredient_id!, val)}
                                  unit={ri.ingredient?.unit || ''}
                                  shiftStep={50}
                                />
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => removeIngredient(ri.ingredient_id!)}
                                  className="p-2 text-stone-300 hover:text-bistro-red hover:bg-white rounded-lg transition-all shadow-sm"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>

                    {/* Vista Móvil: Tarjetas Táctiles */}
                    <div className="sm:hidden p-4 space-y-4">
                      {recipeIngredients.length === 0 ? (
                        <div className="py-12 text-center opacity-30">
                          <Scale size={32} className="mx-auto mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Añade insumos arriba</p>
                        </div>
                      ) : (
                        recipeIngredients.map((ri) => (
                          <div key={ri.ingredient_id} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h5 className="font-black text-bistro-green text-lg leading-tight">{ri.ingredient?.name}</h5>
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Unidad: {ri.ingredient?.unit}</span>
                              </div>
                              <button 
                                onClick={() => removeIngredient(ri.ingredient_id!)}
                                className="p-3 text-stone-300 active:text-bistro-red active:bg-bistro-red/5 rounded-xl transition-all"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                            <SmartQuantityInput
                                value={ri.quantity || 0}
                                onChange={(val) => updateIngredientQty(ri.ingredient_id!, val)}
                                unit={ri.ingredient?.unit || ''}
                                shiftStep={50}
                              />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Resumen Fórmula */}
                  <footer className="p-6 bg-bistro-green text-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 leading-none mb-1">Masa Total Insumos</p>
                        <h5 className="text-2xl font-black tabular-nums">{Math.round(calculateSum())} <span className="text-xs font-bold">{form.yield_unit}</span></h5>
                      </div>
                      <button 
                        onClick={() => setForm(prev => ({ ...prev, yield_amount: Math.round(calculateSum()).toString() }))}
                        className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/20"
                      >
                        Aplicar a Rendimiento
                      </button>
                    </div>
                  </footer>
                </div>
              </div>
            </div>

            {/* Pie de Acciones FIJO para Móvil (Sticky Footer) */}
            <footer className="sticky bottom-0 p-4 sm:p-8 border-t border-stone-100 flex gap-3 bg-white z-[61] shadow-[0_-8px_20px_rgba(0,0,0,0.06)]" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <button
                onClick={handleClose}
                className="px-5 sm:px-8 py-3.5 rounded-2xl border-2 border-stone-200 font-black text-stone-500 uppercase tracking-widest text-[9px] sm:text-[10px] hover:bg-stone-50 transition-all active:scale-95 flex-shrink-0"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.yield_amount}
                className="flex-1 py-3.5 rounded-2xl bg-bistro-gold text-white font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 hover:bg-black shadow-xl shadow-bistro-gold/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={4} />}
                {editingId ? 'Guardar Cambios' : 'Crear Receta'}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Lista de Recetas Optimizada para Tocar */}
      {recipes.length === 0 ? (
        <div className="p-12 text-center text-stone-400 font-medium bg-white rounded-3xl border border-stone-200 shadow-inner">
          No hay recetas maestras cargadas.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4 sm:gap-5">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => handleEdit(recipe)}
              className="group bg-white p-5 sm:p-6 rounded-[1.75rem] shadow-sm border-2 border-transparent hover:border-bistro-gold/40 hover:shadow-2xl transition-all duration-300 cursor-pointer active:scale-[0.97] flex flex-col"
            >
              <div className="flex justify-between items-start mb-3 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-1.5 mb-2">
                    {recipe.category && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-bistro-gold bg-bistro-gold/10 px-2 py-0.5 rounded-full">
                        {recipe.category}
                      </span>
                    )}
                    <span className="bg-stone-50 text-stone-400 text-[8px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                      ID-{recipe.id.slice(0, 5)}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-bistro-green leading-tight tracking-tight line-clamp-2">
                    {recipe.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(recipe.id, recipe.name);
                    }}
                    className="text-stone-400 hover:text-bistro-red p-2.5 sm:p-2 bg-stone-50 rounded-xl transition-all active:scale-90"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-bistro-gold border border-stone-100 group-hover:bg-bistro-gold group-hover:text-white transition-all shadow-sm">
                    <ChevronRight strokeWidth={4} size={16} />
                  </div>
                </div>
              </div>

              {recipe.description && (
                <p className="text-stone-400 font-medium text-[11px] mb-3 line-clamp-2 leading-relaxed flex-1">
                  {recipe.description}
                </p>
              )}

              <footer className="mt-auto pt-3 border-t border-stone-100 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest">Rendimiento</span>
                  <span className="font-black text-bistro-green text-sm leading-none">
                    {Math.round(recipe.yield_amount)} <span className="text-[9px]">{recipe.yield_unit}</span>
                  </span>
                </div>
                <span className="text-[8px] font-black text-bistro-gold uppercase flex items-center gap-0.5">
                  <Check size={9} strokeWidth={4} /> Validada
                </span>
              </footer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
