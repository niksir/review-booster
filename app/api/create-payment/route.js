export async function POST(request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    
    return Response.json({ 
      hasKey: !!stripeKey,
      keyStart: stripeKey ? stripeKey.substring(0, 10) : 'missing'
    })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
