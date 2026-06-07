import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function shortenUrl(url) {
  try {
    const response = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
    )
    return await response.text()
  } catch {
    return url
  }
}

async function sendSmsSmsbox(phone, text) {
  const params = new URLSearchParams({
    username: process.env.SMSBOX_USERNAME,
    password: process.env.SMSBOX_PASSWORD,
    from: 'ReviewBoost',
    to: phone,
    text,
    coding: 'UTF8'
  })

  const response = await fetch(
    `https://www.smsbox.gr/httpapi/sendsms.php?${params.toString()}`
  )
  const result = await response.text()
  return result.trim().startsWith('20')
}

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { phones: phonesJson, gmbLink, businessName, message } = session.metadata

    const phones = JSON.parse(phonesJson)
    const shortLink = await shortenUrl(gmbLink)

    const smsText = message
      ? `${message} ${shortLink}`
      : `Ευχαριστουμε απο ${businessName}! Θα μας βοηθουσατε με μια κριτικη στο Google: ${shortLink}`

    for (const phone of phones) {
      await sendSmsSmsbox(phone, smsText)
    }
  }

  return Response.json({ received: true })
}
