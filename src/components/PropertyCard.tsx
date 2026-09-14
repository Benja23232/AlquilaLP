"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  propertyType: string;
  neighborhood: string;
  rooms: number;
  isVerified: boolean;
  images?: string[];
  imageUrl?: string;
}

export default function PropertyCard({
  id,
  title,
  price,
  propertyType,
  neighborhood,
  rooms,
  isVerified,
  images = [],
  imageUrl
}: PropertyCardProps) {
  const listImages = images.length > 0 ? images : (imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800']);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('directos_favorites') || '[]');
    setIsFavorite(favs.includes(id));
  }, [id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let favs = JSON.parse(localStorage.getItem('directos_favorites') || '[]');
    if (favs.includes(id)) {
      favs = favs.filter((favId: string) => favId !== id);
      setIsFavorite(false);
    } else {
      favs.push(id);
      setIsFavorite(true);
    }
    localStorage.setItem('directos_favorites', JSON.stringify(favs));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % listImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + listImages.length) % listImages.length);
  };

  return (
    <Link 
      href={`/inmueble/${id}`} 
      className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col group relative block"
    >
      {/* Contenedor de Imagen */}
      <div className="h-56 bg-slate-100 relative overflow-hidden">
        <Image 
          src={listImages[currentIndex]} 
          alt={title} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
        />
        
        {/* Gradiente sutil inferior */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>

        {/* Insignia de Dueño Verificado */}
        {isVerified && (
          <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1.5 border border-white/20">
            <span>🛡️</span> Dueño Verificado
          </div>
        )}

        {/* Botón de Favorito */}
        <button 
          onClick={toggleFavorite}
          className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all z-10 cursor-pointer ${
            isFavorite 
              ? 'bg-red-500 text-white scale-110 shadow-red-500/30' 
              : 'bg-white/90 text-slate-700 hover:bg-white hover:scale-105'
          }`}
          title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>

        {/* Contador de Fotos */}
        {listImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full z-10 border border-white/10 shadow">
            📷 {currentIndex + 1} / {listImages.length}
          </div>
        )}

        {/* Botones del Carrusel */}
        {listImages.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-10 font-bold text-base cursor-pointer"
            >
              ‹
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-10 font-bold text-base cursor-pointer"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="p-6 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Categoría / Tipo de Propiedad en forma de píldora */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full tracking-wide uppercase border border-blue-100">
              {propertyType} • {rooms} {rooms === 1 ? 'Ambiente' : 'Ambientes'}
            </span>
          </div>

          <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-1.5 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          
          <p className="text-slate-500 text-sm mb-4 flex items-center gap-1 font-medium">
            <span>📍</span> {neighborhood}
          </p>
        </div>

        {/* Sección de Precio y Flecha */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Valor Mensual</p>
            <p className="text-slate-900 font-extrabold text-2xl tracking-tight">
              ${price.toLocaleString('es-AR')}
            </p>
          </div>
          
          {/* Icono de detalle que responde al hover de la tarjeta */}
          <span className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm">
            ➔
          </span>
        </div>
      </div>
    </Link>
  );
}