import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

function toGreekUpperGsm(text) {
  // Μετατροπή σε κεφαλαία (ελληνικά + λατινικά)
  return text.toLocaleUpperCase('el-GR')
}

async function sendSmsSmsbox(phone, text, from) {
  const params = new URLSearchParams({
    username: process.env.SMSBOX_USERNAME,
    password: process.env.SMSBOX_PASSWORD,
    from: from,
    to: phone,
    text,
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

    const rawText = message
      ? `${message} ${gmbLink}`
      : `Ευχαριστουμε απο ${businessName}! Θα μας βοηθουσατε με μια κριτικη στο Google: ${gmbLink}`

    const smsText = toGreekUpperGsm(rawText)

    for (const phone of phones) {
      await sendSmsSmsbox(phone, smsText, businessName)
    }
  }

  return Response.json({ received: true })
}
