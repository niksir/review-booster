import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const { phones, gmbLink, businessName, message } = await request.json()

    const smsText = message 
      ? `${message} ${gmbLink} - STOP για διαγραφή`
      : `Σας ευχαριστούμε από ${businessName}! Θα μας βοηθούσατε πολύ με μια κριτική στο Google: ${gmbLink} - STOP για διαγραφή`

    // Αποθήκευση campaign στη Supabase
    const { data: campaign } = await supabase
      .from('campaigns')
      .insert({ name: `Καμπάνια ${new Date().toLocaleDateString('el-GR')}`, status: 'sending', total_sent: phones.length })
      .select()
      .single()

    let sent = 0
    let failed = 0

    for (const phone of phones) {
      try {
        // Αποστολή SMS μέσω Vonage
        const response = await fetch('https://rest.nexmo.com/sms/json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: process.env.VONAGE_API_KEY,
            api_secret: process.env.VONAGE_API_SECRET,
            to: phone,
            from: 'ReviewBoost',
            text: smsText
          })
        })

        const data = await response.json()
        
        if (data.messages[0].status === '0') {
          sent++
          // Αποθήκευση στη Supabase
          await supabase.from('recipients').insert({
            campaign_id: campaign.id,
            phone: phone,
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

    // Ενημέρωση campaign status
    await supabase
      .from('campaigns')
      .update({ status: 'done', total_sent: sent })
      .eq('id', campaign.id)

    return Response.json({ sent, failed })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
