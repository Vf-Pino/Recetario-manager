'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';
import { Upload, CheckCircle2, AlertTriangle, FileUp } from 'lucide-react';

export default function CSVImporter() {
  const [status, setStatus] = useState<'idle' | 'parsing' | 'uploading' | 'success' | 'error'>(
    'idle'
  );
  const [message, setMessage] = useState('');

  const [stats, setStats] = useState({ success: 0, failed: 0 });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('parsing');
    setMessage('Procesando archivo CSV...');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        setStatus('uploading');
        setMessage(`Subiendo ${results.data.length} ingredientes a Supabase...`);

        let failCount = 0;

        const validRows: { name: string; unit: string; cost_per_unit: number; stock: number }[] =
          [];

        for (const row of results.data as Record<string, string>[]) {
          const { name, unit, cost_per_unit, stock } = row;
          if (!name || !unit) {
            failCount++;
            continue;
          }
          validRows.push({
            name,
            unit,
            cost_per_unit: parseFloat(cost_per_unit) || 0,
            stock: parseFloat(stock) || 0,
          });
        }

        let successCount = 0;

        if (validRows.length > 0) {
          // Batch insert para mejor rendimiento y evitar colapso de red/memoria
          const { error } = await supabase.from('ingredients').insert(validRows);
          if (error) {
            console.error('Error insertando lote:', error);
            failCount += validRows.length;
          } else {
            successCount = validRows.length;
          }
        }

        setStats({ success: successCount, failed: failCount });
        setStatus(
          failCount === 0 && successCount > 0 ? 'success' : successCount > 0 ? 'error' : 'error'
        );
        if (failCount === 0) {
          setMessage(`¡Importación exitosa! ${successCount} registrados.`);
        } else {
          setMessage(`Completado con errores: ${successCount} insertados, ${failCount} fallidos.`);
        }
      },
      error: (error) => {
        setStatus('error');
        setMessage(`Error leyendo el archivo: ${error.message}`);
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-bistro-gold/20 p-6 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-bistro-cream rounded-full flex items-center justify-center text-bistro-green mb-4">
        {status === 'success' ? (
          <CheckCircle2 size={32} />
        ) : status === 'error' ? (
          <AlertTriangle size={32} className="text-bistro-red" />
        ) : (
          <Upload size={32} />
        )}
      </div>

      <h3 className="font-black text-bistro-green text-xl mb-2">Importar Inventario CSV</h3>
      <p className="text-stone-500 font-bold text-sm mb-6 max-w-sm">
        Sube el archivo{' '}
        <span className="p-1 px-2 bg-stone-100 rounded text-bistro-olive">
          template_ingredientes.csv
        </span>{' '}
        para inicializar tu base de datos.
      </p>

      {status === 'idle' && (
        <label className="cursor-pointer bg-bistro-green text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all active:scale-95 flex items-center gap-2">
          <FileUp size={20} /> Seleccionar Archivo
          <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
        </label>
      )}

      {(status === 'parsing' || status === 'uploading') && (
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-bistro-gold animate-pulse w-full"></div>
          </div>
          <span className="font-bold text-bistro-olive text-sm animate-pulse">{message}</span>
        </div>
      )}

      {(status === 'success' || status === 'error') && (
        <div
          className={`p-4 rounded-xl w-full ${status === 'success' ? 'bg-bistro-green/10 text-bistro-green' : 'bg-bistro-red/10 text-bistro-red'}`}
        >
          <p className="font-black">{message}</p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-3 text-xs font-bold uppercase tracking-widest underline underline-offset-4"
          >
            Subir otro archivo
          </button>
        </div>
      )}
    </div>
  );
}
