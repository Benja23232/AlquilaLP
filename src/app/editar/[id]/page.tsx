"use client";

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditarPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params); // Desempaquetamos el ID de la URL en Next.js 15+

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'departamento',
    rooms: 1,
    neighborhood: '',
    price: '',
    expenses: '',
    isActive: true,
  });

  // Cargar los datos actuales de la propiedad
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data: property, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // SEGURIDAD: Verificamos que el logueado sea realmente el dueño
        if (property.owner_id !== session.user.id) {
          alert('No tenés permiso para editar esta propiedad.');
          router.push('/dashboard');
          return;
        }

        // Rellenamos el estado con los datos de la base
        setFormData({
          title: property.title,
          description: property.description,
          propertyType: property.property_type,
          rooms: property.rooms,
          neighborhood: property.neighborhood,
          price: property.price,
          expenses: property.expenses,
          isActive: property.is_active,
        });

      } catch (error) {
        console.error("Error:", error);
        alert("No se pudo cargar la propiedad.");
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('properties')
        .update({
          title: formData.title,
          description: formData.description,
          property_type: formData.propertyType,
          rooms: Number(formData.rooms),
          neighborhood: formData.neighborhood,
          price: Number(formData.price),
          expenses: Number(formData.expenses) || 0,
          is_active: formData.isActive
        })
        .eq('id', id); // Actualizamos SOLO esta propiedad

      if (error) throw error;

      alert("¡Propiedad actualizada con éxito!");
      router.push('/dashboard');

    } catch (error: any) {
      console.error(error);
      alert("Error al actualizar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans tracking-tight">
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tighter hover:opacity-85 transition-all">
            Alquila<span className="text-blue-500">LP</span>.
          </Link>
          <Link href="/dashboard" className="text-xs md:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            Volver al Panel
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Editar publicación</h1>
          <p className="text-slate-500 text-sm md:text-base">Modificá los datos o pausá el anuncio si ya lo alquilaste.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl md:rounded-[2rem] shadow-xl border border-slate-100 space-y-6 md:space-y-8">
          
          {/* Switch de Estado (Activo / Pausado) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">Estado del anuncio</h3>
              <p className="text-xs md:text-sm text-slate-500">Si lo pausás, dejará de aparecer en el buscador.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="sr-only peer" />
              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <section className={!formData.isActive ? 'opacity-50 pointer-events-none' : 'transition-opacity'}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Título</label>
                <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tipo</label>
                  <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base">
                    <option value="departamento">Departamento</option>
                    <option value="casa">Casa</option>
                    <option value="ph">PH</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Barrio</label>
                  <input type="text" name="neighborhood" required value={formData.neighborhood} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Ambientes</label>
                  <input type="number" name="rooms" min="1" required value={formData.rooms} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Precio (ARS)</label>
                  <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Expensas (ARS)</label>
                  <input type="number" name="expenses" value={formData.expenses} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
                <textarea name="description" required rows={4} value={formData.description} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm md:text-base" />
              </div>
            </div>
          </section>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 md:py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all text-base md:text-lg mt-4 disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </main>
  );
}