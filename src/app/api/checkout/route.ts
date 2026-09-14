import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { propertyId, title, price } = await request.json();

    const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      throw new Error('Falta configurar el MERCADOPAGO_ACCESS_TOKEN en el archivo .env.local');
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const preferenceData = {
      items: [
        {
          title: `Destacar anuncio: ${title}`,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: Number(price) || 2500, // Precio del destaque en ARS
        },
      ],
      back_urls: {
        success: `${siteUrl}/dashboard?success=true&propertyId=${propertyId}`,
        failure: `${siteUrl}/dashboard?error=true`,
        pending: `${siteUrl}/dashboard?pending=true`,
      },
      // Quitamos auto_return para evitar restricciones con localhost en desarrollo
      external_reference: propertyId,
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || JSON.stringify(data) || 'Error al conectar con Mercado Pago');
    }

    // Devolvemos el link de pago oficial de Mercado Pago
    return NextResponse.json({ init_point: data.init_point });
  } catch (error: any) {
    console.error('Error en checkout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}