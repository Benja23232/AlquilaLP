import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 px-6 border-t border-slate-900 mt-auto">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="md:col-span-2">
          <Link href="/" className="text-2xl font-extrabold text-white tracking-tighter inline-block mb-4">
            Directos<span className="text-blue-500">.</span>
          </Link>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            La plataforma líder de alquiler directo entre dueños e inquilinos en La Plata. Cero comisiones, trato transparente y seguro.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Navegación</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/" className="hover:text-white transition-colors">Buscar propiedades</Link></li>
            <li><Link href="/publicar" className="hover:text-white transition-colors">Publicar inmueble</Link></li>
            <li><Link href="/dashboard" className="hover:text-white transition-colors">Mi Panel</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Zona de Cobertura</h4>
          <ul className="space-y-2.5 text-sm">
            <li><span className="text-slate-400">La Plata (Casco Urbano)</span></li>
            <li><span className="text-slate-400">Tolosa / Gonnet / City Bell</span></li>
            <li><span className="text-slate-500">Buenos Aires, Argentina</span></li>
          </ul>
        </div>
      </div>
      
      {/* BARRA INFERIOR MODIFICADA */}
      <div className="max-w-6xl mx-auto pt-8 border-t border-slate-900/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>
          © {new Date().getFullYear()} Directos. Todos los derechos reservados.
        </p>
        <p>
          Diseño y desarrollo por{' '}
          <a 
            href="https://www.instagram.com/code.byben/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 font-bold transition-colors"
          >
            @code.byben
          </a>
        </p>
      </div>
    </footer>
  );
}
