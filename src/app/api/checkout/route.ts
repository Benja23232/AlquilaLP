import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Inicializamos Mercado Pago con el nombre exacto de tu variable
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN as string 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Recibimos el ID y el título de la propiedad a destacar
    const { propertyId, title } = body;

    const preference = new Preference(client);
    
    // Creamos la preferencia (el link de pago)
    const response = await preference.create({
      body: {
        items: [
          {
            id: propertyId,
            title: `Destacar Propiedad: ${title}`,
            quantity: 1,
            unit_price: 5000, // Precio fijo en $5.000 ARS
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?status=success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?status=pending`,
        },
        auto_return: 'approved',
        external_reference: propertyId, // Guardamos el ID para saber qué propiedad destacar después
      },
    });

    // Devolvemos el link que nos dio Mercado Pago
    return NextResponse.json({ init_point: response.init_point });
  } catch (error) {
    console.error('Error al crear preferencia de Mercado Pago:', error);
    return NextResponse.json({ error: 'Error al crear el link de pago' }, { status: 500 });
  }
}