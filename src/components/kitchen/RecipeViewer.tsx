'use client';
import { useState } from 'react';
import { Recipe, RecipeIngredient } from '@/types/database';
import { Scale, Info, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import KitchenHeader from '@/components/kitchen/KitchenHeader';
import SmartQuantityInput from '@/components/common/SmartQuantityInput';

interface Props {
  recipe: Recipe;
  ingredients: RecipeIngredient[];
}

export default function RecipeViewer({ recipe, ingredients }: Props) {
  const [targetYield, setTargetYield] = useState<number>(recipe.yield_amount);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const multiplier = targetYield / recipe.yield_amount;

  return (
    <div
      className="relative select-none pb-20 overflow-x-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      <KitchenHeader showSearch={false} />

      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-8">
        <div className="mb-6">
          <Link
            href="/kitchen"
            className="inline-flex items-center gap-2 text-[#6b705a] hover:text-[#3b5442] transition-colors font-black text-xs uppercase tracking-widest active:scale-95"
          >
            <ArrowLeft size={16} strokeWidth={3} /> Volver a Estación
          </Link>
        </div>

        <div className="bg-white rounded-[1.5rem] p-6 sm:p-10 shadow-lg border-2 border-bistro-gold/10 mb-6 z-10 relative">
          <h1 className="text-2xl sm:text-5xl font-black text-bistro-green tracking-tight leading-tight break-words">
            {recipe.name}
          </h1>
          <p className="text-bistro-olive mt-2 sm:mt-3 font-bold text-base sm:text-xl leading-relaxed">
            {recipe.description}
          </p>
        </div>

        <div className="bg-white rounded-[1.5rem] p-5 sm:p-10 mb-8 shadow-lg z-10 relative border-2 border-bistro-green/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 text-bistro-green mb-1">
                <Scale size={28} strokeWidth={3} />
                <h2 className="font-black text-xl sm:text-3xl tracking-tight uppercase">
                  Multiplicador
                </h2>
              </div>
              <p className="text-bistro-olive font-black text-sm sm:text-lg px-4 py-2 bg-bistro-cream/40 rounded-lg inline-block border border-bistro-gold/20">
                Base: {recipe.yield_amount} {recipe.yield_unit}
              </p>
            </div>
            <div className="w-full lg:w-auto flex justify-center">
              <div className="w-full max-w-sm">
                <SmartQuantityInput
                  value={targetYield}
                  onChange={setTargetYield}
                  unit={recipe.yield_unit}
                  shiftStep={50}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] shadow-lg border-2 border-bistro-green/5 overflow-hidden mb-8 z-10 relative">
          <div className="bg-bistro-green p-5 sm:px-10 border-b-2 border-bistro-gold/40 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h3 className="font-black text-white text-lg sm:text-2xl uppercase tracking-tight">
              Ingredientes
            </h3>
            {recipe.bakers_percentage_base_ingredient_id && (
              <span className="text-[10px] sm:text-sm font-black uppercase tracking-widest bg-bistro-gold text-bistro-green px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm w-fit">
                <Info size={16} strokeWidth={3} /> % Panadero
              </span>
            )}
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[320px] sm:min-w-[450px]">
              <thead>
                <tr className="bg-white text-bistro-olive text-[10px] sm:text-sm uppercase tracking-widest border-b border-bistro-cream">
                  <th className="p-4 sm:px-10 font-black">Insumo</th>
                  <th className="p-4 sm:px-10 font-black">Cantidad</th>
                  {recipe.bakers_percentage_base_ingredient_id && (
                    <th className="p-4 sm:px-10 font-black text-right">%</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-bistro-cream">
                {ingredients.map((ri) => {
                  const calculatedQty = ri.quantity * multiplier;
                  const formattedQty = parseFloat(calculatedQty.toFixed(2));
                  return (
                    <tr
                      key={ri.id}
                      className={`transition-all ${ri.is_bakers_percentage_base ? 'bg-bistro-gold/5' : 'bg-transparent'}`}
                    >
                      <td
                        className="p-4 sm:p-10 border-l-[4px] sm:border-l-[6px] border-transparent data-[isbase=true]:border-bistro-gold"
                        data-isbase={ri.is_bakers_percentage_base}
                      >
                        <span className="font-black text-base sm:text-2xl text-bistro-green tracking-tight break-words block leading-tight">
                          {ri.ingredient?.name}
                        </span>
                        {ri.is_bakers_percentage_base && (
                          <span className="inline-block text-[8px] sm:text-xs text-bistro-green font-black mt-1 uppercase tracking-widest bg-bistro-gold px-2 py-1 rounded-md">
                            100% Base
                          </span>
                        )}
                      </td>
                      <td className="p-4 sm:p-10">
                        <div className="flex items-baseline gap-2">
                          <span className="font-black text-2xl sm:text-5xl text-bistro-green border-b-2 border-bistro-gold/20 pb-0.5">
                            {formattedQty}
                          </span>
                          <span className="text-[10px] sm:text-xl font-black text-bistro-olive uppercase">
                            {ri.ingredient?.unit}
                          </span>
                        </div>
                      </td>
                      {recipe.bakers_percentage_base_ingredient_id && (
                        <td className="p-4 sm:p-10 text-right font-black text-bistro-green text-base sm:text-3xl opacity-40">
                          {ri.bakers_percentage ? `${ri.bakers_percentage}%` : '-'}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {recipe.procedure_text && (
          <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-lg border-2 border-bistro-green/5 z-10 relative">
            <h3 className="font-black text-bistro-green text-3xl md:text-4xl mb-10 uppercase tracking-tight text-center sm:text-left">
              Procedimiento
            </h3>
            <div className="space-y-6">
              {recipe.procedure_text
                .split('\n')
                .filter((p) => p.trim() !== '')
                .map((paragraph, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveStep(activeStep === idx ? null : idx)}
                    className={`flex gap-5 md:gap-8 p-6 md:p-8 rounded-[2rem] cursor-pointer transition-all border-2 select-none
                    ${
                      activeStep === idx
                        ? 'bg-bistro-gold/10 border-bistro-gold scale-[1.02] shadow-xl shadow-bistro-gold/10'
                        : 'bg-stone-50 border-transparent hover:bg-stone-100 hover:border-bistro-gold/20'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center shrink-0 text-2xl font-black transition-colors shadow-sm
                    ${activeStep === idx ? 'bg-bistro-red text-white shadow-bistro-red/20' : 'bg-white text-bistro-olive border-2 border-stone-200'}`}
                    >
                      {idx + 1}
                    </div>
                    <p
                      className={`text-xl md:text-2xl leading-relaxed font-bold transition-colors pt-1.5
                    ${activeStep === idx ? 'text-black font-black' : 'text-bistro-green/70'}`}
                    >
                      {paragraph.replace(/^[0-9]+[.\-]\s*/, '')}
                    </p>
                    {activeStep === idx && (
                      <CheckCircle2
                        className="text-bistro-red ml-auto shrink-0 self-center hidden sm:block"
                        size={40}
                        strokeWidth={3}
                      />
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
