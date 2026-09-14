import React from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { Metadata } from 'next';

export const revalidate = 0; 

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  const { data: property } = await supabase
    .from('properties')
    .select('title, description, property_images(image_url)')
    .eq('id', id)
    .single();

  if (!property) return { title: 'Propiedad no encontrada | AlquilaLP' };

  const imageUrl = property.property_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200';
  const shortDescription = property.description ? property.description.substring(0, 150) + '...' : 'Alquilá directo sin comisiones en La Plata.';

  return {
    title: `${property.title} | AlquilaLP`,
    description: shortDescription,
    openGraph: {
      title: property.title,
      description: shortDescription,
      images: [imageUrl],
      type: 'website',
    }
  };
}

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Consultar la propiedad principal
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      profiles ( id, full_name, phone, is_verified, account_type, company_name ),
      property_images ( image_url )
    `)
    .eq('id', id)
    .single();

  if (error || !property) {
    return (
      <main className="min-h-screen bg-white text-slate-900 font-sans tracking-tight flex flex-col justify-between">
        <div>
          <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <Link href="/" className="text-xl md:text-2xl font-extrabold text-white tracking-tighter drop-shadow-md">
                Alquila<span className="text-blue-500">LP</span>.
              </Link>
              <Link href="/" className="text-xs md:text-sm font-semibold text-slate-300 hover:text-white transition-colors">← Volver al buscador</Link>
            </div>
          </header>
          <div className="flex flex-col items-center justify-center p-4 py-20">
            <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-200">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Propiedad no encontrada</h2>
              <p className="text-slate-600 text-sm md:text-base mb-6">El inmueble no existe o fue pausado.</p>
              <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 text-sm md:text-base">Volver al inicio</Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // 2. Consultar Propiedades Similares (mismo tipo de propiedad, excluyendo la actual)
  const { data: similarProperties } = await supabase
    .from('properties')
    .select(`
      *,
      profiles!inner ( is_verified ),
      property_images ( image_url )
    `)
    .eq('is_active', true)
    .eq('property_type', property.property_type)
    .neq('id', id)
    .limit(3);

  const images = property.property_images || [];
  const mainImage = images[0]?.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200';
  const owner = property.profiles || {};
  const isVerified = owner.is_verified || false;
  const isCompany = owner.account_type === 'empresa';
  const advertiserName = isCompany && owner.company_name ? owner.company_name : (owner.full_name || 'Dueño Directo');
  const whatsappLink = `https://wa.me/549${owner.phone}?text=Hola!%20Vi%20tu%20${property.property_type}%20en%20AlquilaLP%20y%20me%20interesa.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Accommodation",
    "name": property.title,
    "description": property.description,
    "image": images.map((img: any) => img.image_url),
    "numberOfRooms": property.rooms,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.neighborhood,
      "addressRegion": "Buenos Aires",
      "addressCountry": "AR"
    },
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "ARS",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans tracking-tight flex flex-col justify-between">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div>
        <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl md:text-2xl font-extrabold text-white tracking-tighter">
              Alquila<span className="text-blue-500">LP</span>.
            </Link>
            <Link href="/" className="text-xs md:text-sm font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5">
              <span>←</span> Volver al buscador
            </Link>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          {/* GALERÍA DE FOTOS RESPONSIVA */}
          <div className="mb-8 md:mb-10">
            {images.length <= 1 ? (
              <div className="w-full h-[300px] sm:h-[400px] md:h-[450px] rounded-2xl md:rounded-[2rem] overflow-hidden bg-slate-100 relative shadow-sm border border-slate-200">
                <img src={mainImage} alt={property.title} className="w-full h-full object-cover" />
                {isVerified && (
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-blue-600/95 backdrop-blur-md text-white px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-lg">
                    ✅ Dueño Verificado
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 h-auto md:h-[480px]">
                <div className="md:col-span-2 h-[300px] sm:h-[380px] md:h-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-slate-100 relative shadow-sm border border-slate-200">
                  <img src={mainImage} alt={property.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  {isVerified && (
                    <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-blue-600/95 backdrop-blur-md text-white px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-1.5 shadow-lg">
                      ✅ Dueño Verificado
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-3 md:gap-4 h-auto md:h-full">
                  {images.slice(1, 5).map((img: any, idx: number) => (
                    <div key={idx} className="h-40 sm:h-48 md:h-full rounded-xl md:rounded-2xl overflow-hidden bg-slate-100 relative shadow-sm border border-slate-200">
                      <img src={img.image_url} alt="Detalle" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6">
                  <span className="bg-slate-100 text-slate-700 px-3.5 py-1 rounded-full text-xs md:text-sm font-bold capitalize">{property.property_type}</span>
                  <span className="bg-slate-100 text-slate-700 px-3.5 py-1 rounded-full text-xs md:text-sm font-bold">{property.rooms} {property.rooms === 1 ? 'Ambiente' : 'Ambientes'}</span>
                  <span className="text-slate-500 text-xs md:text-sm font-medium ml-1">📍 {property.neighborhood}</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 md:mb-8 leading-tight">{property.title}</h1>
                <h2 className="text-lg md:text-xl font-bold mb-3 text-slate-900">Descripción</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-base md:text-lg">{property.description}</p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white p-6 sm:p-8 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-xl lg:sticky lg:top-8">
                <p className="text-xs md:text-sm text-slate-500 font-bold mb-1 uppercase tracking-wider">Valor Mensual</p>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">${property.price.toLocaleString('es-AR')}</h3>
                
                <div className="flex justify-between items-center text-slate-600 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-slate-100 text-sm md:text-base">
                  <span className="font-medium">Expensas aprox.</span>
                  <span className="font-bold text-base md:text-lg">${property.expenses?.toLocaleString('es-AR') || '0'}</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 md:p-5 mb-6 md:mb-8 border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {isCompany ? '🏢 Inmobiliaria / Empresa' : '👤 Dueño Directo'}
                  </p>
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg md:text-xl shrink-0">
                      {advertiserName.charAt(0)}
                    </div>
                    <div>
                      {isCompany ? (
                        <Link href={`/perfil/${owner.id}`} className="font-bold text-slate-900 text-base md:text-lg hover:text-blue-600 transition-colors underline decoration-slate-300 underline-offset-4">
                          {advertiserName} ↗
                        </Link>
                      ) : (
                        <p className="font-bold text-slate-900 text-base md:text-lg">{advertiserName}</p>
                      )}

                      {isVerified ? (
                        <span className="text-xs md:text-sm font-bold text-blue-600 flex items-center gap-1.5 mt-1">✅ Identidad Verificada</span>
                      ) : (
                        <span className="text-xs md:text-sm font-medium text-slate-500 mt-1 block">Usuario estándar</span>
                      )}
                    </div>
                  </div>
                </div>

                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 md:py-4 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all text-base md:text-lg"
                >
                  Contactar al anunciante
                </a>
                <p className="text-center text-xs md:text-sm text-slate-500 mt-4 font-medium">Trato directo y transparente.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE PROPIEDADES SIMILARES */}
        {similarProperties && similarProperties.length > 0 && (
          <div className="bg-slate-50 py-12 md:py-16 border-t border-slate-200 mt-10">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 md:mb-8">Otras propiedades similares que podrían interesarte</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {similarProperties.map((prop) => (
                  <PropertyCard 
                    key={prop.id}
                    id={prop.id}
                    title={prop.title}
                    price={prop.price}
                    propertyType={prop.property_type}
                    neighborhood={prop.neighborhood}
                    rooms={prop.rooms}
                    isVerified={prop.profiles?.is_verified || false}
                    images={prop.property_images?.map((img: any) => img.image_url) || []}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </main>
  );
}