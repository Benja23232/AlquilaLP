"use client";

import React, { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ACÁ ESTÁ LA LÓGICA DINÁMICA: 
  // Lee de la URL de dónde venía el usuario. Si entró directo al login sin redirección, por defecto va al /dashboard.
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setErrorMsg("El correo electrónico y la contraseña son obligatorios.");
      return;
    }

    if (isSignUp) {
      if (!formData.fullName.trim() || !formData.phone.trim()) {
        setErrorMsg("Por favor, completá tu nombre y teléfono para poder registrarte.");
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
            }
          }
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: formData.fullName,
            phone: formData.phone,
            account_type: 'particular',
            is_verified: false
          });
        }

        alert("¡Cuenta creada con éxito! Ya podés iniciar sesión o comenzar a publicar.");
        setIsSignUp(false);
        setFormData(prev => ({ ...prev, password: '' })); 
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;

        // LA SOLUCIÓN DEFINITIVA: Forzamos una recarga limpia del navegador.
        // Esto asegura que el layout del admin o dashboard lea la sesión correcta.
        window.location.href = redirectTo;
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans tracking-tight flex flex-col justify-between text-slate-900">
      <div>
        <div className="bg-slate-900 bg-gradient-to-b from-slate-900 to-slate-800 pb-28 md:pb-32">
          <header className="px-4 md:px-6 py-4 md:py-6 max-w-5xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl md:text-2xl font-extrabold text-white tracking-tighter drop-shadow-md hover:opacity-80 transition-all">
              Alquila<span className="text-blue-500">LP</span>.
            </Link>
            <Link href="/" className="text-xs md:text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              ← Volver al inicio
            </Link>
          </header>

          <div className="max-w-xl mx-auto px-4 pt-8 md:pt-10 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 md:mb-4">
              {isSignUp ? 'Creá tu cuenta en' : 'Bienvenido a'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AlquilaLP</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg">
              {isSignUp ? 'Publicá tus inmuebles o guardá tus favoritos sin intermediarios.' : 'Ingresá a tu panel para administrar tus publicaciones.'}
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 -mt-8 md:-mt-12 relative z-10 mb-20">
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-[2rem] shadow-2xl border border-slate-100 space-y-6">
            
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg("");
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg("");
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Registrarse
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-pulse">
                {errorMsg}
              </div>
            )}

            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nombre y Apellido</label>
                  <input 
                    type="text" 
                    name="fullName" 
                    required={isSignUp}
                    value={formData.fullName} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium text-sm md:text-base placeholder:text-slate-400" 
                    placeholder="Ej: Juan Pérez" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Teléfono / WhatsApp</label>
                  <input 
                    type="text" 
                    name="phone" 
                    required={isSignUp}
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium text-sm md:text-base placeholder:text-slate-400" 
                    placeholder="Ej: 2214567890 (sin 0 ni 15)" 
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Correo electrónico</label>
              <input 
                type="email" 
                name="email" 
                required 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium text-sm md:text-base placeholder:text-slate-400" 
                placeholder="tu@email.com" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
              <input 
                type="password" 
                name="password" 
                required 
                value={formData.password} 
                onChange={handleChange} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium text-sm md:text-base placeholder:text-slate-400" 
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 md:py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all text-base md:text-lg mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Procesando...' : (isSignUp ? 'Crear Cuenta' : 'Entrar al Panel')}
            </button>

            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg("");
                }}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:underline"
              >
                {isSignUp ? '¿Ya tenés cuenta? Iniciá sesión' : '¿No tenés cuenta? Registrate gratis'}
              </button>
            </div>

          </form>
        </div>
      </div>
      <Footer />
    </main>
  );
}

// 3. Exportamos el componente envuelto en Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <LoginContent />
    </Suspense>
  );
}