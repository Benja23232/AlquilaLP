"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import PropertyCard from '@/components/PropertyCard';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function FavoritosPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favs = JSON.parse(localStorage.getItem('directos_favorites') || '[]');
        if (favs.length === 0) {
          setProperties([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            profiles!inner ( is_verified ),
            property_images ( image_url )
          `)
          .in('id', favs)
          .eq('is_active', true);

        if (error) throw error;
        setProperties(data || []);
      } catch (err) {
        console.error("Error al cargar favoritos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans tracking-tight flex flex-col justify-between">
      <div>
        {/* Navbar Oscuro */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl md:text-2xl font-extrabold text-white tracking-tighter drop-shadow-md hover:opacity-80 transition-all">
              Alquila<span className="text-blue-500">LP</span>.
            </Link>
            <Link href="/" className="text-xs md:text-sm font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <span>←</span> Volver al buscador
            </Link>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="mb-8 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Tus Propiedades Favoritas ❤️</h1>
            <p className="text-slate-600 text-sm md:text-base">Guardá los inmuebles que te interesan para compararlos y contactar a los dueños fácilmente.</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-2xl md:rounded-3xl border border-slate-200 border-dashed max-w-xl mx-auto">
              <p className="text-slate-500 text-base md:text-lg mb-4">No guardaste ninguna propiedad todavía.</p>
              <Link href="/" className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-full hover:bg-blue-700 transition text-sm md:text-base">
                Explorar propiedades
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {properties.map((prop) => {
                const propertyImages = prop.property_images?.map((img: any) => img.image_url) || [];
                const isVerified = prop.profiles?.is_verified || false;

                return (
                  <PropertyCard 
                    key={prop.id}
                    id={prop.id}
                    title={prop.title}
                    price={prop.price}
                    propertyType={prop.property_type}
                    neighborhood={prop.neighborhood}
                    rooms={prop.rooms}
                    isVerified={isVerified}
                    images={propertyImages}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}