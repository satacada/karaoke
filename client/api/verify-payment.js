// ==============================================================================
// SERVERLESS ENDPOINT: VERIFICACIÓN REAL DE PAGOS / TRANSFERENCIAS MERCADO PAGO
// Archivo: client/api/verify-payment.js
// Regla Clean-by-Design: <= 120 líneas
// ==============================================================================

const MP_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-7360765788803630-101513-42524ca9ce81788d67b2045b82b46a9f-1328223459';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const amount = Number(req.query.amount) || 100;
  const sinceMinutes = Number(req.query.minutes) || 15;
  const sinceTimestamp = Date.now() - (sinceMinutes * 60 * 1000);

  try {
    const url = 'https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=10';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${MP_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: 'Error comunicando con Mercado Pago', details: errText });
    }

    const data = await response.json();
    const results = data.results || [];

    // Busca si hay algún pago aprobado reciente que coincida con el monto
    const matchingPayment = results.find((p) => {
      const isApproved = p.status === 'approved' || p.status_detail === 'accredited';
      const isAmountMatch = Math.abs(Number(p.transaction_amount) - amount) < 1.0;
      const paymentDate = new Date(p.date_created || p.date_approved).getTime();
      return isApproved && isAmountMatch && paymentDate >= sinceTimestamp;
    });

    if (matchingPayment) {
      return res.status(200).json({
        verified: true,
        paymentId: matchingPayment.id,
        amount: matchingPayment.transaction_amount,
        status: matchingPayment.status,
        dateApproved: matchingPayment.date_approved || matchingPayment.date_created,
      });
    }

    return res.status(200).json({
      verified: false,
      message: `Aún no se detecta transferencia de $${amount} ARS en los últimos ${sinceMinutes} minutos.`,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Fallo interno al verificar pago', details: String(err?.message || err) });
  }
}
