import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { phones, gmbLink, businessName, message } = await request.json()
    
    const quantity = phones.length
    const amount = Math.round(quantity * 0.09 * 100) // σε cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Review Booster — Αποστολή SMS`,
              description: `${quantity} SMS x 0.09€`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      failure_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
      metadata: {
        phones: JSON.stringify(phones),
        gmbLink,
        businessName,
        message
      }
    })

    return Response.json({ url: session.url })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
