import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

// Cambiá esto por tu dominio real cuando lo subas a Vercel
const DOMAIN = 'https://tudominiodirectos.com'; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Rutas estáticas de la aplicación
  const routes = [
    {
      url: `${DOMAIN}`,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1,
    },
    {
      url: `${DOMAIN}/publicar`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // 1. Buscamos todas las propiedades activas
  const { data: properties } = await supabase
    .from('properties')
    .select('id, created_at')
    .eq('is_active', true);

  const propertyRoutes = properties?.map((prop) => ({
    url: `${DOMAIN}/inmueble/${prop.id}`,
    lastModified: new Date(prop.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  })) || [];

  // 2. Buscamos todos los perfiles de inmobiliarias/empresas
  const { data: companies } = await supabase
    .from('profiles')
    .select('id')
    .eq('account_type', 'empresa');

  const companyRoutes = companies?.map((company) => ({
    url: `${DOMAIN}/perfil/${company.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || [];

  // Devolvemos todo junto para Google
  return [...routes, ...propertyRoutes, ...companyRoutes];
}