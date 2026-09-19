"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingProfiles, setPendingProfiles] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // 1. Si no está logueado, lo pateamos al login pasándole la ruta. 
        // Usamos window.location para forzar la URL y evitar que Next.js cachee errores.
        if (!session) {
          window.location.href = '/login?redirectTo=/admin';
          return;
        }

        // 2. Verificamos si tiene el rol de admin en la base de datos
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        // 3. Si no es admin, lo mandamos al dashboard
        if (!profile?.is_admin) {
          window.location.href = '/dashboard';
          return;
        }

        setIsAdmin(true);

        // 4. Si es admin, cargamos los perfiles pendientes
        const { data: pending, error: pendingError } = await supabase
          .from('profiles')
          .select('*')
          .eq('verification_status', 'pending');

        if (pendingError) throw pendingError;
        setPendingProfiles(pending || []);
      } catch (err) {
        console.error('Error al cargar panel:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetch();
  }, []);

  const handleUpdateStatus = async (userId: string, status: 'approved' | 'rejected') => {
    setProcessingId(userId);
    try {
      const isVerified = status === 'approved';
      const { error } = await supabase
        .from('profiles')
        .update({ 
          verification_status: status,
          is_verified: isVerified 
        })
        .eq('id', userId);

      if (error) throw error;

      setPendingProfiles(prev => prev.filter(p => p.id !== userId));
      alert(status === 'approved' ? '¡Usuario verificado con éxito!' : 'Solicitud rechazada.');
    } catch (error: any) {
      alert('Error al actualizar: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  // PANTALLA DE CARGA DE SEGURIDAD
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // SI NO ES ADMIN, NO RENDERIZA NADA (ya lo redirigió arriba)
  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans tracking-tight flex flex-col justify-between">
      <div>
        {/* NAVBAR */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl md:text-2xl font-extrabold text-white tracking-tighter">
              Alquila<span className="text-blue-500">LP</span>. <span className="text-xs text-blue-400 font-normal uppercase bg-blue-950 px-2 py-0.5 rounded ml-2">Panel Admin</span>
            </Link>
            <Link href="/dashboard" className="text-xs md:text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Volver al Dashboard
            </Link>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Solicitudes de Verificación Pendientes</h1>
            <p className="text-slate-600 text-sm md:text-base">Revisá los documentos subidos por los dueños e inmobiliarias y aprobá o rechazá las insignias de confianza.</p>
          </div>

          {pendingProfiles.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-2xl md:rounded-3xl border border-slate-200 border-dashed">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">No hay solicitudes pendientes</h3>
              <p className="text-slate-500 text-sm">Todas las cuentas al día.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProfiles.map((p) => (
                <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                        {p.account_type === 'empresa' ? '🏢 Inmobiliaria' : '👤 Particular'}
                      </span>
                      <span className="text-xs text-slate-400">ID: {p.id.substring(0, 8)}...</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{p.company_name || p.full_name || 'Sin nombre'}</h3>
                    <p className="text-sm text-slate-600">Teléfono: <span className="font-semibold">{p.phone || 'No especificado'}</span></p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                    {p.verification_doc_url ? (
                      <button 
                        onClick={() => setPreviewUrl(p.verification_doc_url)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs md:text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        📄 Ver Documento
                      </button>
                    ) : (
                      <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-medium">Sin archivo adjunto</span>
                    )}

                    <button
                      onClick={() => handleUpdateStatus(p.id, 'approved')}
                      disabled={processingId === p.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs md:text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {processingId === p.id ? '...' : '✅ Aprobar'}
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(p.id, 'rejected')}
                      disabled={processingId === p.id}
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2.5 rounded-xl text-xs md:text-sm transition-colors disabled:opacity-50 border border-red-200 cursor-pointer"
                    >
                      {processingId === p.id ? '...' : '❌ Rechazar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL PARA PREVISUALIZAR EL DOCUMENTO */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl md:rounded-[2rem] p-6 max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Documento de Verificación</h3>
              <button 
                onClick={() => setPreviewUrl(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-slate-100 rounded-xl p-3 flex items-center justify-center min-h-[350px]">
              {previewUrl.toLowerCase().includes('.pdf') ? (
                <iframe src={previewUrl} className="w-full h-[500px] rounded-lg border-0" title="PDF Document" />
              ) : (
                <img src={previewUrl} alt="Documento de identidad" className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm" />
              )}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <a 
                href={previewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Abrir archivo en pestaña nueva ↗
              </a>
              <button 
                onClick={() => setPreviewUrl(null)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar vista previa
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}