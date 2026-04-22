'use client';

import { useState, useEffect, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';

interface SmartQuantityInputProps {
  value: number;
  onChange: (val: number) => void;
  unit: string;
  min?: number;
  step?: number;
  shiftStep?: number;
  size?: 'sm' | 'md';
}

export default function SmartQuantityInput({
  value,
  onChange,
  unit,
  min = 0,
  step = 1,
  shiftStep = 50,
  size = 'md',
}: SmartQuantityInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(Math.round(value)));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) setInputValue(String(Math.round(value)));
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  const change = (amount: number) => onChange(Math.max(min, value + amount));

  const startHold = (amount: number) => {
    change(amount);
    let count = 0;
    timerRef.current = setInterval(() => {
      count++;
      const accel = count > 15 ? 5 : 1;
      onChange(Math.max(min, value + amount * accel));
    }, 120);
  };

  const stopHold = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const commit = () => {
    const num = parseFloat(inputValue.replace(',', '.'));
    if (!isNaN(num) && num >= min) onChange(num);
    else setInputValue(String(Math.round(value)));
    setIsEditing(false);
  };

  const formatDisplay = (v: number) => {
    const rounded = Math.round(v);
    if (unit.toLowerCase() === 'g' && rounded >= 1000)
      return `${(rounded / 1000).toFixed(1)} kg`;
    if (unit.toLowerCase() === 'ml' && rounded >= 1000)
      return `${(rounded / 1000).toFixed(1)} lt`;
    return `${rounded} ${unit}`;
  };

  const isSmall = size === 'sm';

  return (
    <div className={`flex items-center ${isSmall ? 'gap-1' : 'gap-2'} w-full`}>
      {/* ─ Minus ─ */}
      <button
        type="button"
        aria-label="Reducir cantidad"
        onMouseDown={(e) => startHold(e.shiftKey ? -shiftStep : -step)}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={(e) => { e.preventDefault(); startHold(-step); }}
        onTouchEnd={stopHold}
        className={`${isSmall ? 'w-8 h-8 rounded-lg' : 'w-12 h-12 rounded-2xl'} flex-shrink-0 bg-bistro-red text-white flex items-center justify-center shadow-md active:scale-90 transition-transform select-none touch-manipulation`}
      >
        <Minus size={isSmall ? 14 : 20} strokeWidth={3} />
      </button>

      {/* ─ Display / Input ─ */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') { setInputValue(String(Math.round(value))); setIsEditing(false); }
            }}
            className={`w-full bg-white border-2 border-bistro-gold rounded-xl px-2 py-2 text-center font-black text-bistro-green outline-none ${isSmall ? 'text-sm' : 'text-xl'}`}
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={`w-full bg-white border-2 border-bistro-gold/30 hover:border-bistro-gold rounded-xl px-2 py-2 text-center font-black text-bistro-green transition-colors truncate ${isSmall ? 'text-xs' : 'text-base'}`}
          >
            {formatDisplay(value)}
          </button>
        )}
      </div>

      {/* ─ Plus ─ */}
      <button
        type="button"
        aria-label="Aumentar cantidad"
        onMouseDown={(e) => startHold(e.shiftKey ? shiftStep : step)}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={(e) => { e.preventDefault(); startHold(step); }}
        onTouchEnd={stopHold}
        className={`${isSmall ? 'w-8 h-8 rounded-lg' : 'w-12 h-12 rounded-2xl'} flex-shrink-0 bg-bistro-green text-white flex items-center justify-center shadow-md active:scale-90 transition-transform select-none touch-manipulation`}
      >
        <Plus size={isSmall ? 14 : 20} strokeWidth={3} />
      </button>
    </div>
  );
}
