import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function sendSmsSmsbox(phone, text) {
  const username = process.env.niksir
  const password = process.Nikitas69788700!
  
  const params = new URLSearchParams({
    username,
    password,
    from: 'ReviewBoost',
    to: phone,
    text,
    coding: 'UTF8'
  })

  const response = await fetch(
    `https://www.smsbox.gr/httpapi/sendsms.php?${params.toString()}`
  )
  
  const result = await response.text()
  // Επιστρέφει "20 ..." αν πήγε καλά
  return result.trim().startsWith('20')
}

export async function POST(request) {
  try {
    const { phones, gmbLink, businessName, message } = await request.json()

    const smsText = message
      ? `${message} ${gmbLink} - STOP για διαγραφη`
      : `Ευχαριστουμε απο ${businessName}! Αφηστε μας μια κριτικη στο Google: ${gmbLink} - STOP για διαγραφη`

    const { data: campaign } = await supabase
      .from('campaigns')
      .insert({
        name: `Καμπάνια ${new Date().toLocaleDateString('el-GR')}`,
        status: 'sending',
        total_sent: phones.length
      })
      .select()
      .single()

    let sent = 0
    let failed = 0

    for (const phone of phones) {
      try {
        const success = await sendSmsSmsbox(phone, smsText)
        
        if (success) {
          sent++
          await supabase.from('recipients').insert({
            campaign_id: campaign.id,
            phone,
            status: 'sent',
            sent_at: new Date()
          })
        } else {
          failed++
        }
      } catch {
        failed++
      }
    }

    await supabase
      .from('campaigns')
      .update({ status: 'done', total_sent: sent })
      .eq('id', campaign.id)

    return Response.json({ sent, failed })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
