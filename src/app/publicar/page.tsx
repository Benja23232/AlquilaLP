"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function PublicarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', description: '', propertyType: 'departamento',
    rooms: 1, neighborhood: '', price: '', expenses: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Tenés que iniciar sesión para publicar.");
        router.push('/login');
      }
    };
    checkUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages(selectedFiles);
      const previews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No se encontró el usuario");

      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          owner_id: user.id,
          title: formData.title, description: formData.description,
          property_type: formData.propertyType, rooms: Number(formData.rooms),
          neighborhood: formData.neighborhood, price: Number(formData.price),
          expenses: Number(formData.expenses) || 0, is_active: true
        })
        .select().single();

      if (propertyError) throw propertyError;

      if (images.length > 0 && property) {
        for (const file of images) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${property.id}-${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('property_images').upload(fileName, file);
          if (uploadError) continue;
          
          const { data: publicUrlData } = supabase.storage.from('property_images').getPublicUrl(fileName);
          await supabase.from('property_images').insert({ property_id: property.id, image_url: publicUrlData.publicUrl });
        }
      }

      alert("¡Propiedad publicada con éxito!");
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      alert("Error al publicar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans tracking-tight flex flex-col justify-between text-slate-900">
      <div>
        {/* MINI HERO OSCURO (Conecta con el Home) */}
        <div className="bg-slate-900 bg-gradient-to-b from-slate-900 to-slate-800 pb-28 md:pb-32">
          <header className="px-4 md:px-6 py-4 md:py-6 max-w-5xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl md:text-2xl font-extrabold text-white tracking-tighter drop-shadow-md hover:opacity-80 transition-all">
              Alquila<span className="text-blue-500">LP</span>.
            </Link>
            <Link href="/dashboard" className="text-xs md:text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Cancelar y volver
            </Link>
          </header>

          <div className="max-w-3xl mx-auto px-4 pt-8 md:pt-10 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 md:mb-4">
              Publicá tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">inmueble</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg">Cargá los datos de tu propiedad y empezá a recibir consultas directo en tu WhatsApp.</p>
          </div>
        </div>

        {/* FORMULARIO FLOTANTE (Sube sobre el hero oscuro) */}
        <div className="max-w-3xl mx-auto px-4 -mt-8 md:-mt-12 relative z-10 mb-20">
          <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2rem] shadow-2xl border border-slate-100 space-y-6 md:space-y-8">
            
            <section>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">1. Datos principales</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Título del anuncio</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium placeholder:text-slate-400 text-sm md:text-base" placeholder="Ej: Departamento céntrico..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Tipo</label>
                    <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium text-sm md:text-base">
                      <option value="departamento">Departamento</option>
                      <option value="casa">Casa</option>
                      <option value="ph">PH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Barrio</label>
                    <input type="text" name="neighborhood" required value={formData.neighborhood} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium placeholder:text-slate-400 text-sm md:text-base" placeholder="Ej: Casco Urbano" />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">2. Condiciones y Detalles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Ambientes</label>
                  <input type="number" name="rooms" min="1" required value={formData.rooms} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Precio (ARS)</label>
                  <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium placeholder:text-slate-400 text-sm md:text-base" placeholder="Ej: 250000" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Expensas (ARS)</label>
                  <input type="number" name="expenses" value={formData.expenses} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium placeholder:text-slate-400 text-sm md:text-base" placeholder="Ej: 15000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Descripción detallada</label>
                <textarea name="description" required rows={4} value={formData.description} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900 font-medium placeholder:text-slate-400 text-sm md:text-base" placeholder="Describí los detalles de tu inmueble..." />
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">3. Fotos del Inmueble</h2>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 md:p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="block w-full text-xs sm:text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                <p className="text-xs text-slate-400 mt-4">Formatos JPG o PNG. Podés seleccionar varias.</p>
              </div>
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-200">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 md:py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all text-base md:text-lg mt-4 disabled:opacity-50">
              {loading ? 'Publicando...' : 'Publicar Inmueble'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </main>
  );
}