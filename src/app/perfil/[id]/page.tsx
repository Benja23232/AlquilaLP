import React from 'react';
import { supabase } from '@/lib/supabase';
import PropertyCard from '@/components/PropertyCard';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const revalidate = 0;

export default async function CompanyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Consultar el perfil de la empresa / inmobiliaria
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (profileError || !profile) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 font-sans tracking-tight flex flex-col justify-between">
        <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl md:text-2xl font-extrabold text-white tracking-tighter">
              Alquila<span className="text-blue-500">LP</span>.
            </Link>
            <Link href="/" className="text-xs md:text-sm font-semibold text-slate-300 hover:text-white transition-colors">← Volver al buscador</Link>
          </div>
        </header>
        <div className="text-center py-20 px-4">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Perfil no encontrado</h2>
          <p className="text-slate-600 text-sm md:text-base mb-6">La inmobiliaria o empresa que buscás no existe o fue dada de baja.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-full font-medium text-sm md:text-base">Volver al inicio</Link>
        </div>
        <Footer />
      </main>
    );
  }

  // 2. Consultar las propiedades activas de esta empresa
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select(`
      *,
      profiles ( is_verified ),
      property_images ( image_url )
    `)
    .eq('owner_id', id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const companyName = profile.company_name || profile.full_name || 'Inmobiliaria Directa';
  const isVerified = profile.is_verified || false;
  const whatsappLink = profile.phone ? `https://wa.me/549${profile.phone}?text=Hola!%20Vi%20sus%20propiedades%20en%20AlquilaLP%20y%20me%20interesa%20consultar.` : '#';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans tracking-tight flex flex-col justify-between">
      <div>
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

        {/* HERO INSTITUCIONAL DE LA EMPRESA */}
        <section className="bg-slate-900 bg-gradient-to-b from-slate-900 to-slate-800 text-white pb-20 md:pb-24 pt-12 md:pt-16 px-4 md:px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
            <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-4xl md:text-5xl shadow-xl shadow-blue-500/20 border-2 border-white/20 shrink-0">
              {companyName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mb-2">
                <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px] md:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  🏢 Inmobiliaria / Empresa Verificada
                </span>
                {isVerified && (
                  <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] md:text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    ✅ Identidad Validada
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">{companyName}</h1>
              <p className="text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed mb-6 font-light">
                {profile.company_bio || 'Empresa dedicada al corretaje inmobiliario y alquiler directo de propiedades en la región.'}
              </p>
              {profile.phone && (
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30 transition-all text-sm"
                >
                  💬 Contactar por WhatsApp
                </a>
              )}
            </div>
          </div>
        </section>

        {/* PROPIEDADES DE LA EMPRESA */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-6 md:-mt-10 relative z-10 mb-20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8 bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Propiedades en alquiler de esta empresa</h2>
            <span className="bg-blue-50 text-blue-700 text-xs md:text-sm font-bold px-4 py-1.5 rounded-full">{properties?.length || 0} activas</span>
          </div>

          {!properties || properties.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 border-dashed">
              <p className="text-slate-500 text-base md:text-lg">Esta empresa no tiene propiedades publicadas en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {properties.map((prop) => {
                const propertyImages = prop.property_images?.map((img: any) => img.image_url) || [];
                const isPropVerified = prop.profiles?.is_verified || false;

                return (
                  <PropertyCard 
                    key={prop.id}
                    id={prop.id}
                    title={prop.title}
                    price={prop.price}
                    propertyType={prop.property_type}
                    neighborhood={prop.neighborhood}
                    rooms={prop.rooms}
                    isVerified={isPropVerified}
                    images={propertyImages}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}