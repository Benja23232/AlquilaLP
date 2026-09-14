"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados actuales
  const [barrio, setBarrio] = useState(searchParams.get('barrio') || '');
  const [tipo, setTipo] = useState(searchParams.get('tipo') || '');
  const [verificados, setVerificados] = useState(searchParams.get('verificados') === 'true');
  const [orden, setOrden] = useState(searchParams.get('orden') || 'recientes');
  const [precioMin, setPrecioMin] = useState(searchParams.get('min') || '');
  const [precioMax, setPrecioMax] = useState(searchParams.get('max') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (barrio) params.set('barrio', barrio);
    if (tipo) params.set('tipo', tipo);
    if (verificados) params.set('verificados', 'true');
    if (orden) params.set('orden', orden);
    if (precioMin) params.set('min', precioMin);
    if (precioMax) params.set('max', precioMax);

    // NUEVO: Agregamos #resultados para que la página baje sola al buscar
    router.push(`/?${params.toString()}#resultados`);
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="w-full max-w-[1200px] bg-white p-2 rounded-[2rem] xl:rounded-full shadow-2xl flex flex-col xl:flex-row items-center gap-3 xl:gap-1 relative z-20 border border-slate-200"
    >
      
      {/* Input de Barrio */}
      <input 
        type="text" 
        value={barrio}
        onChange={(e) => setBarrio(e.target.value)}
        placeholder="¿En qué barrio buscás?" 
        className="w-full xl:w-auto flex-1 bg-transparent text-slate-900 font-medium placeholder-slate-500 px-4 py-2.5 outline-none rounded-full focus:bg-slate-50 transition-colors min-w-[180px]" 
      />
      
      <div className="hidden xl:block w-px h-8 bg-slate-200 shrink-0 mx-1"></div>
      
      {/* Selector de Tipo */}
      <select 
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="w-full xl:w-auto bg-slate-50 xl:bg-transparent text-slate-900 text-sm font-medium px-3 py-2.5 outline-none rounded-full cursor-pointer hover:bg-slate-100 xl:hover:bg-slate-50 transition-colors shrink-0"
      >
        <option value="">Tipo de Inmueble</option>
        <option value="departamento">Departamento</option>
        <option value="casa">Casa</option>
        <option value="ph">PH</option>
      </select>

      <div className="hidden xl:block w-px h-8 bg-slate-200 shrink-0 mx-1"></div>

      {/* Rango de Precios */}
      <div className="flex items-center justify-center w-full xl:w-auto gap-1 px-1 shrink-0">
        <input 
          type="number" 
          value={precioMin}
          onChange={(e) => setPrecioMin(e.target.value)}
          placeholder="Mín $" 
          className="w-1/2 xl:w-20 bg-slate-50 text-slate-900 font-medium placeholder-slate-400 px-3 py-2 outline-none rounded-full border border-slate-200 focus:border-blue-400 focus:bg-white transition-all text-sm"
        />
        <span className="text-slate-400 font-medium">-</span>
        <input 
          type="number" 
          value={precioMax}
          onChange={(e) => setPrecioMax(e.target.value)}
          placeholder="Máx $" 
          className="w-1/2 xl:w-20 bg-slate-50 text-slate-900 font-medium placeholder-slate-400 px-3 py-2 outline-none rounded-full border border-slate-200 focus:border-blue-400 focus:bg-white transition-all text-sm"
        />
      </div>

      <div className="hidden xl:block w-px h-8 bg-slate-200 shrink-0 mx-1"></div>

      {/* Selector de Orden */}
      <select 
        value={orden}
        onChange={(e) => setOrden(e.target.value)}
        className="w-full xl:w-auto bg-slate-50 xl:bg-transparent text-slate-900 text-sm font-medium px-3 py-2.5 outline-none rounded-full cursor-pointer hover:bg-slate-100 xl:hover:bg-slate-50 transition-colors shrink-0"
      >
        <option value="recientes">Más recientes</option>
        <option value="precio-asc">Menor precio</option>
        <option value="precio-desc">Mayor precio</option>
      </select>
      
      <div className="hidden xl:block w-px h-8 bg-slate-200 shrink-0 mx-1"></div>
      
      {/* Checkbox Verificados */}
      <label className="flex items-center justify-center gap-1.5 px-2 py-2 cursor-pointer group whitespace-nowrap bg-slate-50 xl:bg-transparent rounded-full w-full xl:w-auto hover:bg-slate-100 xl:hover:bg-slate-50 transition-colors shrink-0">
        <input 
          type="checkbox" 
          checked={verificados}
          onChange={(e) => setVerificados(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white cursor-pointer" 
        />
        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
          Solo Verificados
        </span>
      </label>
      
      {/* Botón Buscar */}
      <button 
        type="submit" 
        className="w-full xl:w-auto bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-full font-bold shadow-lg hover:shadow-blue-500/30 transition-all shrink-0 ml-1 cursor-pointer"
      >
        Buscar
      </button>
    </form>
  );
}