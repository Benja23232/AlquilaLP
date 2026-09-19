"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';

function DashboardCard({ prop, onDelete }: { prop: any; onDelete: (id: string) => void }) {
  const images = prop.property_images?.map((img: any) => img.image_url) || [];
  const displayImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paying, setPaying] = useState(false);

  const handleFeatureProperty = async () => {
    setPaying(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: prop.id,
          title: prop.title,
        }),
      });

      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point; // Redirige al checkout de Mercado Pago
      } else {
        throw new Error(data.error || 'No se pudo iniciar el pago');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
      setPaying(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      <div className="h-48 bg-slate-200 relative overflow-hidden">
        <img 
          src={displayImages[currentIndex]} 
          alt={prop.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          <span className="bg-white/95 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {prop.is_active ? '🟢 Activo' : '⚪ Pausado'}
          </span>
          {prop.is_featured && (
            <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
              ⭐ Destacado
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-1">{prop.title}</h3>
        <p className="text-blue-600 font-bold mb-3 text-xl">${prop.price.toLocaleString('es-AR')}</p>
        
        {/* Botón de Destacar actualizado */}
        {!prop.is_featured && (
          <button 
            onClick={handleFeatureProperty}
            disabled={paying}
            className="w-full mb-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {paying ? 'Redirigiendo a MP...' : '⭐ Destacar anuncio ($5.000)'}
          </button>
        )}

        <div className="mt-auto grid grid-cols-3 gap-2">
          <Link href={`/inmueble/${prop.id}`} className="text-center bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center">Ver</Link>
          <Link href={`/editar/${prop.id}`} className="text-center bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center">Editar</Link>
          <button onClick={() => onDelete(prop.id)} className="text-center bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold py-2.5 rounded-xl transition-colors">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados para configuración de Empresa / Tipo de Cuenta y Teléfono
  const [accountType, setAccountType] = useState('particular');
  const [companyName, setCompanyName] = useState('');
  const [companyBio, setCompanyBio] = useState('');
  const [phone, setPhone] = useState(''); // ESTADO NUEVO PARA EL TELÉFONO
  const [savingProfile, setSavingProfile] = useState(false);

  // Estados para Modal y Solicitud de Verificación Real
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyFile, setVerifyFile] = useState<File | null>(null);

  // 1. Detectar retorno exitoso de Mercado Pago y activar destaque
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const status = queryParams.get('status'); 
    const externalReference = queryParams.get('external_reference'); 

    const activateFeatured = async () => {
      if ((status === 'approved' || status === 'success') && externalReference) {
        try {
          const { error } = await supabase
            .from('properties')
            .update({ is_featured: true })
            .eq('id', externalReference);

          if (error) throw error;
          alert('¡Pago exitoso! Tu propiedad ya se encuentra destacada en el portal.');
          
          window.history.replaceState({}, document.title, window.location.pathname);
          window.location.reload(); 
        } catch (err: any) {
          console.error('Error al activar destaque:', err);
        }
      }
    };

    activateFeatured();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }

        const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (userProfile) {
          setProfile(userProfile);
          setAccountType(userProfile.account_type || 'particular');
          setCompanyName(userProfile.company_name || '');
          setCompanyBio(userProfile.company_bio || '');
          setPhone(userProfile.phone || ''); // CARGAMOS EL TELÉFONO INICIAL DE LA BD
        }

        const { data: userProperties, error } = await supabase
          .from('properties')
          .select(`*, property_images ( image_url )`)
          .eq('owner_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProperties(userProperties || []);
      } catch (error) {
        console.error("Error al cargar el dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleUpdateAccountType = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          account_type: accountType, 
          company_name: accountType === 'empresa' ? companyName : null,
          company_bio: accountType === 'empresa' ? companyBio : null,
          phone: phone // GUARDAMOS EL TELÉFONO NUEVO O MODIFICADO EN LA BD
        })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ 
        ...profile, 
        account_type: accountType, 
        company_name: accountType === 'empresa' ? companyName : null,
        company_bio: accountType === 'empresa' ? companyBio : null,
        phone: phone // ACTUALIZAMOS EL ESTADO VISUAL
      });
      alert("¡Perfil actualizado con éxito!");
    } catch (error: any) {
      alert("Error al actualizar perfil: " + error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyFile) {
      alert("Por favor, subí una foto de tu documento o credencial profesional.");
      return;
    }

    setVerifying(true);
    try {
      const fileExt = verifyFile.name.split('.').pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('verification_docs').upload(fileName, verifyFile);

      if (uploadError) {
        throw new Error("Error al subir el documento. Verificá que el bucket 'verification_docs' exista en Supabase.");
      }

      const { data: urlData } = supabase.storage.from('verification_docs').getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          verification_doc_url: urlData.publicUrl,
          verification_status: 'pending'
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, verification_status: 'pending' });
      setShowVerifyModal(false);
      alert("¡Documentación enviada con éxito! Nuestro equipo validará tus datos a la brevedad para otorgarte el sello de verificación.");
    } catch (error: any) {
      alert("Error en la solicitud: " + error.message);
    } finally {
      setVerifying(false);
      setVerifyFile(null);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm("¿Estás seguro de que querés eliminar esta propiedad?")) return;
    try {
      const { error } = await supabase.from('properties').delete().eq('id', propertyId);
      if (error) throw error;
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      alert("Propiedad eliminada con éxito.");
    } catch (error: any) {
      alert("No se pudo eliminar: " + error.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans tracking-tight flex flex-col justify-between">
      <div>
        <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl md:text-2xl font-extrabold text-white tracking-tighter drop-shadow-md hover:opacity-80 transition-all">
              Alquila<span className="text-blue-500">LP</span>.
            </Link>
            <div className="flex items-center gap-3 sm:gap-6">
              <Link href="/" className="text-xs md:text-sm font-medium text-slate-300 hover:text-white transition-colors hidden md:block">Ir al buscador</Link>
              {profile?.account_type === 'empresa' && (
                <Link href={`/perfil/${profile.id}`} className="text-xs md:text-sm font-semibold text-blue-400 hover:underline hidden sm:block">Ver mi perfil público</Link>
              )}
              <button onClick={handleSignOut} className="text-xs md:text-sm font-bold text-red-400 hover:text-red-300 transition-colors">Cerrar sesión</button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6 md:space-y-8">
          
          {/* Cabecera del Perfil */}
          <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-5 w-full md:w-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl md:text-3xl shrink-0">
                {profile?.full_name?.charAt(0) || 'D'}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                  Hola, {profile?.full_name?.split(' ')[0] || 'Dueño'}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {profile?.is_verified ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      ✅ Cuenta Verificada
                    </span>
                  ) : profile?.verification_status === 'pending' ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                      ⏳ Verificación en revisión
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                      ⚠️ Cuenta Estándar
                    </span>
                  )}

                  {!profile?.is_verified && profile?.verification_status !== 'pending' && (
                    <button onClick={() => setShowVerifyModal(true)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 bg-blue-50/60 px-3 py-1 rounded-full border border-blue-200 transition-colors cursor-pointer">
                      Verificar identidad 🛡️
                    </button>
                  )}
                </div>
              </div>
            </div>
            <Link href="/publicar" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all w-full md:w-auto text-center shrink-0">
              + Publicar Inmueble
            </Link>
          </div>

          {/* Configuración de Tipo de Anunciante, Bio y TELÉFONO */}
          <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Perfil de Anunciante</h3>
            <p className="text-slate-600 text-sm mb-6">Elegí si publicás como Dueño Directo o Inmobiliaria/Empresa y actualizá tus datos de contacto.</p>
            
            <form onSubmit={handleUpdateAccountType} className="space-y-6 max-w-xl">
              
              {/* INPUT PARA TELÉFONO (Visible para ambos tipos de cuenta) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Teléfono / WhatsApp de contacto</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Ej: 2214567890" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium text-sm md:text-base"
                />
                <p className="text-xs text-slate-500 mt-1">Este número será el que utilicen los inquilinos para contactarte en tus propiedades.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`border rounded-2xl p-4 cursor-pointer flex items-center gap-3 transition-all ${accountType === 'particular' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-200'}`}>
                  <input type="radio" name="accountType" value="particular" checked={accountType === 'particular'} onChange={() => setAccountType('particular')} className="text-blue-600" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Dueño Directo</p>
                    <p className="text-xs text-slate-500">Particular</p>
                  </div>
                </label>
                <label className={`border rounded-2xl p-4 cursor-pointer flex items-center gap-3 transition-all ${accountType === 'empresa' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-200'}`}>
                  <input type="radio" name="accountType" value="empresa" checked={accountType === 'empresa'} onChange={() => setAccountType('empresa')} className="text-blue-600" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Inmobiliaria / Empresa</p>
                    <p className="text-xs text-slate-500">Con perfil público</p>
                  </div>
                </label>
              </div>

              {accountType === 'empresa' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Comercial de la Inmobiliaria</label>
                    <input 
                      type="text" 
                      required 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)} 
                      placeholder="Ej: Propiedades La Plata S.R.L." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Descripción / Biografía institucional</label>
                    <textarea 
                      rows={3}
                      value={companyBio} 
                      onChange={(e) => setCompanyBio(e.target.value)} 
                      placeholder="Contale a los inquilinos sobre su trayectoria, horario de atención o especialidad..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium resize-none text-sm md:text-base"
                    />
                  </div>
                </div>
              )}

              <button type="submit" disabled={savingProfile} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-md cursor-pointer">
                {savingProfile ? 'Guardando...' : 'Guardar cambios de perfil'}
              </button>
            </form>
          </div>

          {/* Listado de Propiedades */}
          <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8 border-b border-slate-100 pb-4">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Mis Inmuebles</h2>
              <span className="bg-blue-50 text-blue-700 text-xs md:text-sm font-bold px-4 py-1.5 rounded-full">{properties.length} activos</span>
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-12 border-2 border-slate-100 border-dashed rounded-3xl bg-slate-50 px-4">
                <p className="text-slate-500 text-base md:text-lg mb-4">Todavía no publicaste ninguna propiedad.</p>
                <Link href="/publicar" className="text-blue-600 font-bold hover:underline text-sm md:text-base">Creá tu primer anuncio ahora</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop) => (
                  <DashboardCard key={prop.id} prop={prop} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE VERIFICACIÓN REAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">🛡️</div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 text-center">Verificá tu Identidad</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed text-center">
              Subí una foto de tu DNI, servicio a tu nombre o credencial profesional para validar tu cuenta y generar mayor confianza en los inquilinos.
            </p>

            <form onSubmit={handleRequestVerification} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  required
                  onChange={(e) => setVerifyFile(e.target.files?.[0] || null)} 
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
                />
              </div>

              <button type="submit" disabled={verifying} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all text-sm md:text-base cursor-pointer">
                {verifying ? 'Enviando documentación...' : 'Enviar para revisión'}
              </button>
              <button type="button" onClick={() => setShowVerifyModal(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors text-sm md:text-base cursor-pointer">Cancelar</button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}