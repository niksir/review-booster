export async function POST(request) {
  try {
    const { phones, gmbLink, businessName, message } = await request.json()

    const quantity = phones.length
    const calculatedAmount = Math.round(quantity * 0.09 * 100)
    const amount = Math.max(calculatedAmount, 50) // ελάχιστο 0.50€

    const stripeKey = process.env.STRIPE_SECRET_KEY

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'payment_method_types[0]': 'card',
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][product_data][name]': 'Review Booster',
        'line_items[0][price_data][product_data][description]': `${quantity} SMS x 0.09€`,
        'line_items[0][price_data][unit_amount]': amount.toString(),
        'line_items[0][quantity]': '1',
        'mode': 'payment',
        'success_url': `${process.env.NEXT_PUBLIC_APP_URL}/success`,
        'cancel_url': `${process.env.NEXT_PUBLIC_APP_URL}`,
        'metadata[phones]': JSON.stringify(phones),
        'metadata[gmbLink]': gmbLink,
        'metadata[businessName]': businessName,
        'metadata[message]': message || ''
      }).toString()
    })

    const session = await response.json()

    if (session.error) {
      return Response.json({ error: session.error.message }, { status: 500 })
    }

    if (!session.url) {
      return Response.json({ error: 'No URL returned' }, { status: 500 })
    }

    return Response.json({ url: session.url })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
