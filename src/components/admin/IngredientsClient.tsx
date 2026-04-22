'use client';
import { useState, useCallback } from 'react';
import { Ingredient } from '@/types/database';
import { Plus, Search, Trash2, X, Check, Loader2, Pencil } from 'lucide-react';
import { formatCostUnit } from '@/lib/format';
import SmartQuantityInput from '@/components/common/SmartQuantityInput';

const API = '/api/admin/data';

interface Props {
  initialData: Ingredient[];
}

export default function IngredientsClient({ initialData }: Props) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', unit: 'g', cost_per_unit: '', stock: '' });

  // Solo se llama al mutar datos — la carga inicial viene del Server Component
  const refetch = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API}?resource=ingredients`);
      const { data } = await res.json();
      if (data) setIngredients(data);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const filtered = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.name || !form.unit) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        unit: form.unit,
        cost_per_unit: parseFloat(form.cost_per_unit) || 0,
        stock: parseFloat(form.stock) || 0,
      };
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource: 'ingredients', payload, id: editingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Error: ${data.error}`);
        return;
      }
      setForm({ name: '', unit: 'g', cost_per_unit: '', stock: '' });
      setEditingId(null);
      setShowForm(false);
      refetch();
    } catch (e: unknown) {
      const error = e as Error;
      alert(`Error inesperado: ${error?.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    await fetch(`${API}?resource=ingredients&id=${id}`, { method: 'DELETE' });
    refetch();
  };

  const handleEdit = (ing: Ingredient) => {
    setForm({
      name: ing.name,
      unit: ing.unit,
      cost_per_unit: ing.cost_per_unit.toString(),
      stock: ing.stock.toString(),
    });
    setEditingId(ing.id);
    setShowForm(true);
  };

  const handleClose = () => {
    setForm({ name: '', unit: 'g', cost_per_unit: '', stock: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
        <div>
          <h2 className="text-3xl font-black text-bistro-green tracking-tight uppercase">
            Insumos y Stock
          </h2>
          <p className="text-[#6b705a] font-bold mt-1 text-sm tracking-wide">
            Base de datos central de materia prima y costos teóricos.
          </p>
        </div>
        <button
          onClick={() => {
            setForm({ name: '', unit: 'g', cost_per_unit: '', stock: '' });
            setEditingId(null);
            setShowForm(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-bistro-green hover:bg-black text-white px-5 py-2.5 rounded-xl transition-all font-bold shadow-sm active:scale-95"
        >
          <Plus size={18} strokeWidth={3} /> Nuevo Ingrediente
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-bistro-green text-xl">
                {editingId ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
              </h3>
              <button onClick={handleClose} className="text-stone-400 hover:text-stone-900">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-500 mb-1.5 block">
                  Nombre *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej: Harina de Trigo"
                  className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 font-bold outline-none focus:border-bistro-gold transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-stone-500 mb-1.5 block">
                  Unidad *
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full border-2 border-stone-200 rounded-xl px-4 py-3 font-bold outline-none focus:border-bistro-gold transition-all bg-white"
                >
                  <option value="g">g — Gramos</option>
                  <option value="ml">ml — Mililitros</option>
                  <option value="unit">unit — Unidad</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-stone-500 mb-1.5 block">
                    Costo/Unidad (COP)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-stone-400 font-bold text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.0001"
                      min="0"
                      value={form.cost_per_unit}
                      onChange={(e) => setForm({ ...form, cost_per_unit: e.target.value })}
                      placeholder="25"
                      className="w-full border-2 border-stone-200 rounded-xl pl-8 pr-4 py-3 font-bold outline-none focus:border-bistro-gold transition-all"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-[#6b705a] mb-3 block">
                    Stock Disponible
                  </label>
                  <SmartQuantityInput
                    value={parseFloat(form.stock) || 0}
                    unit={form.unit}
                    onChange={(val) => setForm({ ...form, stock: val.toString() })}
                    shiftStep={50}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl border-2 border-stone-200 font-bold text-stone-600 hover:bg-stone-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="flex-1 py-3 rounded-xl bg-bistro-green text-white font-bold flex items-center justify-center gap-2 hover:bg-black active:scale-95 disabled:opacity-60"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}{' '}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar ingrediente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-bistro-gold font-medium text-stone-700"
            />
          </div>
          {isRefreshing && <Loader2 size={18} className="animate-spin text-stone-400 ml-auto" />}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white text-stone-400 text-xs uppercase tracking-wider border-b border-stone-200">
                <th className="p-5 font-bold">Nombre</th>
                <th className="p-5 font-bold text-center">Medida</th>
                <th className="p-5 font-bold text-right">Costo unit.</th>
                <th className="p-5 font-bold text-right">Stock</th>
                <th className="p-5 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-400 font-medium">
                    No se encontraron ingredientes.
                  </td>
                </tr>
              ) : (
                filtered.map((ing) => (
                  <tr key={ing.id} className="hover:bg-stone-50 transition-colors group">
                    <td className="p-5 font-bold text-stone-800">{ing.name}</td>
                    <td className="p-5 text-center">
                      <span className="bg-bistro-cream text-bistro-green px-2.5 py-1 rounded-md text-xs font-bold uppercase">
                        {ing.unit}
                      </span>
                    </td>
                    <td className="p-5 text-right font-bold text-bistro-green font-mono text-sm">
                      {formatCostUnit(ing.cost_per_unit)}
                    </td>
                    <td className="p-5 text-right">
                      <span className="font-mono text-stone-700 font-bold">
                        {Math.round(ing.stock)}
                      </span>
                    </td>
                    <td className="p-5 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(ing)}
                        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-bistro-green p-1.5 rounded-lg hover:bg-bistro-green/10 transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(ing.id, ing.name)}
                        className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-bistro-red p-1.5 rounded-lg hover:bg-bistro-red/10 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
