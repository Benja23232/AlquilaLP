"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Alternar entre Iniciar Sesión y Registrarse
  
  // NUEVO: Estado para manejar mensajes de error visuales
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
    setErrorMsg(""); // Limpiamos errores previos al intentar de nuevo

    // --- 1. VALIDACIÓN EN EL FRONTEND ---
    // Chequeo general de email y password (aplica a ambos)
    if (!formData.email.trim() || !formData.password.trim()) {
      setErrorMsg("El correo electrónico y la contraseña son obligatorios.");
      return; // Frenamos la ejecución acá
    }

    // Chequeo específico si se está registrando
    if (isSignUp) {
      if (!formData.fullName.trim() || !formData.phone.trim()) {
        setErrorMsg("Por favor, completá tu nombre y teléfono para poder registrarte.");
        return; // Frenamos la ejecución acá
      }
    }
    // -----------------------------------

    setLoading(true);

    try {
      if (isSignUp) {
        // Registro de usuario en Supabase Auth
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

        // Si la tabla triggers no crea el perfil automáticamente, lo insertamos por seguridad
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
        setIsSignUp(false); // Cambiamos a la vista de login
        // Limpiamos la contraseña por seguridad
        setFormData(prev => ({ ...prev, password: '' })); 
      } else {
        // Inicio de sesión
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;

        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error(error);
      // Reemplazamos el alert por nuestro mensaje de error en la UI
      setErrorMsg(error.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans tracking-tight flex flex-col justify-between text-slate-900">
      <div>
        {/* MINI HERO OSCURO */}
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

        {/* CONTENEDOR FLOTANTE DEL FORMULARIO */}
        <div className="max-w-md mx-auto px-4 -mt-8 md:-mt-12 relative z-10 mb-20">
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-[2rem] shadow-2xl border border-slate-100 space-y-6">
            
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg(""); // Limpiar errores al cambiar de pestaña
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg(""); // Limpiar errores al cambiar de pestaña
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Registrarse
              </button>
            </div>

            {/* CARTEL DE ERROR VISUAL */}
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
                  setErrorMsg(""); // Limpiar errores al cambiar
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