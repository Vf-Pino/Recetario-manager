'use client';
import { useState, useMemo } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { Ingredient } from '@/types/database';

interface IngredientSelectorProps {
  availableIngredients: Ingredient[];
  onSelect: (ingredient: Ingredient) => void;
  isLoading?: boolean;
}

export default function IngredientSelector({
  availableIngredients,
  onSelect,
  isLoading = false,
}: IngredientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm) return [];
    return availableIngredients
      .filter((ing) => ing.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5); // Limitar a 5 resultados para mantenerlo compacto
  }, [availableIngredients, searchTerm]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Search size={14} />
          )}
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar insumo para añadir..."
          className="w-full bg-white border border-stone-200 rounded-lg pl-9 pr-4 py-1.5 font-bold outline-none focus:border-bistro-gold transition-all text-xs shadow-sm"
        />
      </div>

      {searchTerm && filtered.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-lg shadow-xl overflow-hidden divide-y divide-stone-100 z-10 relative">
          {filtered.map((ing) => (
            <button
              key={ing.id}
              onClick={() => {
                onSelect(ing);
                setSearchTerm('');
              }}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-stone-50 transition-colors text-left group"
            >
              <div>
                <span className="font-black text-bistro-green text-[13px] block">{ing.name}</span>
                <span className="text-[9px] text-stone-400 uppercase font-black tracking-widest">
                  {ing.unit}
                </span>
              </div>
              <Plus
                size={14}
                className="text-stone-300 group-hover:text-bistro-gold transition-colors"
              />
            </button>
          ))}
        </div>
      )}

      {searchTerm && filtered.length === 0 && !isLoading && (
        <p className="text-center py-2 text-xs font-bold text-stone-400 italic">
          No se encontraron resultados para &quot;{searchTerm}&quot;
        </p>
      )}
    </div>
  );
}
