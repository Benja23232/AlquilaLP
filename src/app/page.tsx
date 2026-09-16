import React from 'react';
import PropertyCard from '@/components/PropertyCard';
import SearchBar from '@/components/SearchBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 0; 

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  
  const barrio = params.barrio;
  const tipo = params.tipo;
  const min = params.min;
  const max = params.max;
  const verificados = params.verificados === 'true';
  const orden = params.orden || 'recientes';

  let sortColumn = 'created_at';
  let sortAscending = false;

  if (orden === 'precio-asc') {
    sortColumn = 'price';
    sortAscending = true;
  } else if (orden === 'precio-desc') {
    sortColumn = 'price';
    sortAscending = false;
  } else {
    sortColumn = 'created_at';
    sortAscending = false;
  }

  // 1. Armamos la consulta base a Supabase (con prioridad para los destacados)
  let query = supabase
    .from('properties')
    .select(`
      *,
      profiles!inner ( is_verified ),
      property_images ( image_url )
    `)
    .eq('is_active', true)
    .order('is_featured', { ascending: false }) // <-- Los destacados van siempre primero
    .order(sortColumn, { ascending: sortAscending });

  // 2. Aplicamos Filtros opcionales
  if (barrio) query = query.ilike('neighborhood', `%${barrio}%`);
  if (tipo) query = query.eq('property_type', tipo);
  if (min) query = query.gte('price', parseInt(min));
  if (max) query = query.lte('price', parseInt(max));
  if (verificados) query = query.eq('profiles.is_verified', true);

  const { data: properties, error } = await query;

  if (error) {
    console.error('Error al cargar propiedades:', error.message);
  }

  return (
    <main className="min-h-screen bg-[#F5F5F5] text-slate-900 font-sans tracking-tight flex flex-col justify-between scroll-smooth">
      <div>
        {/* NAVBAR */}
        <header className="absolute top-0 w-full z-20 px-4 md:px-6 py-4 md:py-6 flex justify-between items-center">
          <Link href="/" className="text-xl md:text-2xl font-extrabold text-white tracking-tighter drop-shadow-md hover:opacity-80 transition-all">
            Alquila<span className="text-blue-500">LP</span>.
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/favoritos" className="text-white/90 text-xs md:text-sm font-medium hover:text-white transition-colors hidden md:flex items-center gap-1.5 drop-shadow-md">
              ❤️ Favoritos
            </Link>
            <Link href="/dashboard" className="text-white/90 text-xs md:text-sm font-medium hover:text-white transition-colors hidden md:block drop-shadow-md">
              Mi Panel
            </Link>
            <Link href="/publicar" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3.5 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium hover:bg-white/20 transition-all shadow-lg">
              Publicar Inmueble
            </Link>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 flex flex-col items-center justify-center min-h-[75vh] overflow-hidden">
          
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000" 
              alt="Fondo Inmobiliario" 
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-[#F5F5F5]"></div>
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
            
            <div className="mb-4 md:mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] md:text-xs font-semibold uppercase tracking-widest shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Portal de Alquileres en La Plata
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-4 md:mb-6 max-w-4xl leading-tight tracking-tighter drop-shadow-xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Alquilá directo.
              </span>
              <br />
              <span className="text-white">Cero comisiones.</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-200 mb-8 md:mb-10 max-w-2xl font-light drop-shadow-md px-2">
              Explorá cientos de propiedades validadas en La Plata. Conectá directamente con los dueños y mudate de forma segura.
            </p>

            {/* Buscador */}
            <div className="w-full relative z-20 mb-6 md:mb-8">
              <SearchBar />
            </div>

            {/* Insignias de Confianza */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-12 text-slate-300 text-xs sm:text-sm font-medium">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 text-base">✓</span> 100% Trato directo
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 text-base">✓</span> Dueños verificados
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 text-base">✓</span> Sin gastos ocultos
              </div>
            </div>
            
          </div>
        </section>

        {/* SECCIÓN DE PROPIEDADES */}
        <section id="resultados" className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20 -mt-6 md:-mt-10 scroll-mt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-sm gap-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {barrio || tipo || min || max || verificados ? 'Resultados de tu búsqueda' : 'Descubrí tu próximo hogar en La Plata'}
            </h2>
            <span className="text-slate-600 font-bold bg-slate-100 px-4 py-2 rounded-full text-xs md:text-sm border border-slate-200 self-end md:self-auto">
              {properties?.length || 0} resultados
            </span>

          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {properties && properties.length > 0 ? (
              properties.map((prop) => {
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
              })
            ) : (
              <div className="col-span-full text-center py-16 md:py-20 bg-white rounded-[2rem] border border-slate-200 border-dashed shadow-sm px-4">
                <div className="text-5xl md:text-6xl mb-4">🏠</div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">No hay resultados</h3>
                <p className="text-slate-500 text-sm md:text-lg mb-6">No encontramos propiedades que coincidan con tus filtros actuales.</p>
                <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 md:px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-blue-500/30 text-sm md:text-base">
                  Limpiar filtros
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}