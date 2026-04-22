'use client';
import { useState } from 'react';
import { Recipe } from '@/types/database';
import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import KitchenHeader from '@/components/kitchen/KitchenHeader';

interface Props {
  recipes: Recipe[];
}

export default function KitchenView({ recipes }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = recipes.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Recipe[]>>((acc, recipe) => {
    const key = recipe.category || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(recipe);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{ background: '#f5f0e8' }}>
      <KitchenHeader showSearch={true} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
        <div className="mb-8">
          <p
            className="text-[10px] font-black uppercase tracking-[0.3em] mb-2"
            style={{ color: '#c4b99a' }}
          >
            Producción
          </p>
          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ color: '#3b5442' }}
          >
            Recetas activas
          </h1>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-bold" style={{ color: '#b0a890' }}>
              {searchTerm ? `Sin resultados para "${searchTerm}"` : 'No hay recetas aún.'}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([category, categoryRecipes]) => (
              <section key={category}>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-[9px] font-black uppercase tracking-[0.3em]"
                    style={{ color: '#a89e8a' }}
                  >
                    {category}
                  </span>
                  <div className="flex-1 h-px" style={{ background: '#ddd5c4' }} />
                </div>

                <div className="flex flex-col gap-3">
                  {categoryRecipes.map((recipe) => (
                    <Link
                      key={recipe.id}
                      href={`/kitchen/recipe/${recipe.id}`}
                      className="group flex items-center justify-between px-6 py-5 rounded-[1.25rem] transition-all duration-300 hover:shadow-xl active:scale-[0.98] border border-white/40 shadow-sm"
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <div className="flex-1 pr-4">
                        <p
                          className="font-black text-lg sm:text-xl leading-tight tracking-tight"
                          style={{ color: '#3b5442' }}
                        >
                          {recipe.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-bistro-gold bg-bistro-gold/10 px-2 py-0.5 rounded-md">
                            {recipe.yield_amount} {recipe.yield_unit}
                          </span>
                          {recipe.description && (
                            <p className="text-[10px] font-medium text-stone-400 line-clamp-1 italic">
                              — {recipe.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#3b5442] shadow-sm border border-stone-100"
                        style={{ background: '#f0ebe2' }}
                      >
                        <MoveRight
                          size={18}
                          strokeWidth={3}
                          className="transition-colors duration-300 group-hover:text-white"
                          style={{ color: '#3b5442' }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
