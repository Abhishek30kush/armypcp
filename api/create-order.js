
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { order_amount, customer_id, customer_phone, customer_name, customer_email } = req.body;

  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;
  const mode = process.env.CASHFREE_MODE || 'sandbox';

  const url = mode === 'production' 
    ? 'https://api.cashfree.com/pg/orders' 
    : 'https://sandbox.cashfree.com/pg/orders';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify({
        order_amount: order_amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: customer_id,
          customer_phone: customer_phone,
          customer_name: customer_name,
          customer_email: customer_email,
        },
        order_meta: {
          return_url: `https://${req.headers.host}/payment-status?order_id={order_id}`,
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree Error:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
