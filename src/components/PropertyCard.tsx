"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  propertyType: string;
  neighborhood: string;
  rooms: number;
  isVerified: boolean;
  images: string[];
  isFeatured?: boolean;
}

export default function PropertyCard({
  id,
  title,
  price,
  propertyType,
  neighborhood,
  rooms,
  isVerified,
  images,
  isFeatured
}: PropertyCardProps) {
  const displayImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800'];
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <Link href={`/inmueble/${id}`} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group block">
      <div className="h-56 bg-slate-200 relative overflow-hidden">
        <img 
          src={displayImages[currentIndex]} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />

        {/* Insignias superiores */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          {isFeatured && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
              ⭐ Destacado
            </span>
          )}
          {isVerified && (
            <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
              ✓ Verificado
            </span>
          )}
        </div>

        {/* Flechas de navegación (si hay más de una imagen) */}
        {displayImages.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-all z-10 backdrop-blur-sm cursor-pointer"
              aria-label="Anterior imagen"
            >
              ‹
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-all z-10 backdrop-blur-sm cursor-pointer"
              aria-label="Siguiente imagen"
            >
              ›
            </button>

            {/* Indicadores de puntos (dots) */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
              {displayImages.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-4 bg-white shadow' : 'w-1.5 bg-white/60'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {propertyType}
            </span>
            <p className="text-xl font-extrabold text-slate-900">${price.toLocaleString('es-AR')}</p>
          </div>
          <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-1">{title}</h3>
          <p className="text-slate-500 text-sm flex items-center gap-1 mb-3">
            📍 {neighborhood}
          </p>
        </div>
        
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>🛏️ {rooms} amb.</span>
          <span className="text-blue-600 font-bold group-hover:underline">Ver detalle →</span>
        </div>
      </div>
    </Link>
  );
}