'use client'
import { useState } from 'react'

const DOUBLE_CHARS = ['€', '[', ']', '{', '}', '~', '^', '|', '\\']

function countSmsChars(text) {
  let count = 0
  for (const char of text) {
    count += DOUBLE_CHARS.includes(char) ? 2 : 1
  }
  return count
}

function getSmsCount(charCount) {
  if (charCount <= 160) return 1
  if (charCount <= 306) return 2
  if (charCount <= 459) return 3
  return 4
}

export default function Home() {
  const [authed, setAuthed] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [step, setStep] = useState(1)
  const [gmbLink, setGmbLink] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [phones, setPhones] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCodeSubmit = () => {
    if (codeInput === process.env.NEXT_PUBLIC_ACCESS_CODE) {
      setAuthed(true)
      setCodeError(false)
    } else {
      setCodeError(true)
    }
  }

  const handleBusinessNameChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 11)
    setBusinessName(val)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      const lines = text.split('\n').filter(line => line.trim())
      const extractedPhones = lines.map(line => {
        const parts = line.split(/[,;\t]/)
        return parts[0].trim().replace(/\s/g, '')
      }).filter(p => p.match(/^(\+30|0030|69|2)\d+/))
      setPhones(extractedPhones)
    }
    reader.readAsText(file)
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phones, gmbLink, businessName, message, smsPerRecipient })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Σφάλμα: ' + (data.error || 'Άγνωστο σφάλμα'))
        setLoading(false)
      }
    } catch (error) {
      alert('Σφάλμα: ' + error.message)
      setLoading(false)
    }
  }

  const fullText = message + (gmbLink ? ' ' + gmbLink : '')
  const totalChars = countSmsChars(fullText)
  const smsPerRecipient = getSmsCount(totalChars)

  const calculated = phones.length * smsPerRecipient * 0.09
  const finalAmount = calculated < 0.50 ? 0.50 : calculated
  const isMinimum = calculated < 0.50 && phones.length > 0

  const pricingTiers = [
    { label: '1–160 χαρ.', sms: 1, active: totalChars <= 160 },
    { label: '161–306 χαρ.', sms: 2, active: totalChars > 160 && totalChars <= 306 },
    { label: '307–459 χαρ.', sms: 3, active: totalChars > 306 && totalChars <= 459 },
    { label: '460–612 χαρ.', sms: 4, active: totalChars > 459 },
  ]

  if (!authed) {
    return (
      <div style={{maxWidth: 400, margin: '100px auto', padding: 20}}>
        <div style={{background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center'}}>
          <h1 style={{color: '#1a73e8'}}>⭐ Review Booster</h1>
          <p style={{color: '#666'}}>Εισάγετε τον κωδικό πρόσβασης</p>
          <input
            type="password"
            style={{width: '100%', padding: 10, margin: '8px 0 16px', borderRadius: 8, border: codeError ? '2px solid red' : '1px solid #ddd', boxSizing: 'border-box', fontSize: 18, textAlign: 'center'}}
            placeholder="••••••••"
            value={codeInput}
            onChange={e => setCodeInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCodeSubmit()}
          />
          {codeError && <p style={{color: 'red', margin: '0 0 12px'}}>Λάθος κωδικός!</p>}
          <button
            onClick={handleCodeSubmit}
            style={{width: '100%', padding: 14, background: '#1a73e8', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer'}}
          >
            Είσοδος →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{maxWidth: 900, margin: '40px auto', padding: 20}}>
      <h1 style={{color: '#1a73e8', textAlign: 'center'}}>⭐ Review Booster</h1>

      {step === 1 && (
        <div style={{display: 'flex', gap: 20, alignItems: 'flex-start'}}>

          {/* Αριστερά: Φόρμα */}
          <div style={{flex: 2, background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
            <h2 style={{marginTop: 0}}>Βήμα 1: Στοιχεία Επιχείρησης</h2>

            <label>Όνομα Αποστολέα <span style={{color: '#999', fontSize: 13}}>(μόνο αγγλικοί, έως 11)</span></label>
            <input
              style={{width: '100%', padding: 10, margin: '8px 0 4px', borderRadius: 8, border: '1px solid #ddd', boxSizing: 'border-box'}}
              placeholder="π.χ. MyBusiness"
              value={businessName}
              onChange={handleBusinessNameChange}
              maxLength={11}
            />
            <p style={{color: '#999', fontSize: 13, margin: '0 0 16px'}}>{businessName.length}/11 χαρακτήρες</p>

            <label>Google My Business Link</label>
            <input
              style={{width: '100%', padding: 10, margin: '8px 0 16px', borderRadius: 8, border: '1px solid #ddd', boxSizing: 'border-box'}}
              placeholder="https://g.page/r/..."
              value={gmbLink}
              onChange={e => setGmbLink(e.target.value)}
            />

            <label>Μήνυμα SMS <span style={{color: '#999', fontSize: 13}}>(το link προστίθεται αυτόματα στο τέλος)</span></label>
            <textarea
              style={{width: '100%', padding: 10, margin: '8px 0 4px', borderRadius: 8, border: smsPerRecipient > 1 ? '2px solid orange' : '1px solid #ddd', boxSizing: 'border-box', height: 80}}
              placeholder="Σας ευχαριστούμε! Θα μας βοηθούσατε με μια κριτική:"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <p style={{color: smsPerRecipient > 1 ? 'orange' : '#999', fontSize: 13, margin: '0 0 8px'}}>
              {totalChars} χαρακτήρες — <strong>{smsPerRecipient} SMS</strong> ανά παραλήπτη
              {smsPerRecipient > 1 && ` ⚠️ χρέωση x${smsPerRecipient}`}
            </p>

            {/* Preview SMS */}
            <div style={{background: '#f0f4ff', padding: 12, borderRadius: 8, margin: '8px 0 16px', fontSize: 13}}>
              <p style={{margin: '0 0 6px', color: '#888', fontSize: 12}}>ΠΡΟΕΠΙΣΚΟΠΗΣΗ SMS</p>
              <p style={{margin: '0 0 4px', fontWeight: 'bold', color: '#1a73e8', fontSize: 12}}>
                Από: {businessName || '—'}
              </p>
              <p style={{margin: 0, color: '#333', lineHeight: 1.5}}>
                {message}{message && gmbLink ? ' ' : ''}{gmbLink || ''}
              </p>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!businessName || !gmbLink || !message}
              style={{width: '100%', padding: 14, background: businessName && gmbLink && message ? '#1a73e8' : '#ccc', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, cursor: businessName && gmbLink && message ? 'pointer' : 'not-allowed'}}
            >
              Επόμενο →
            </button>
          </div>

          {/* Δεξιά: Τιμολόγιο */}
          <div style={{flex: 1, background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
            <h3 style={{marginTop: 0, color: '#333'}}>💰 Χρέωση SMS</h3>
            <p style={{color: '#666', fontSize: 13, margin: '0 0 16px'}}>Η χρέωση εξαρτάται από το μήκος του μηνύματος</p>

            {pricingTiers.map((tier, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                marginBottom: 8,
                borderRadius: 8,
                background: tier.active ? '#e8f0fe' : '#f8f9fa',
                border: tier.active ? '2px solid #1a73e8' : '2px solid transparent',
              }}>
                <div>
                  <p style={{margin: 0, fontSize: 13, fontWeight: tier.active ? 'bold' : 'normal', color: tier.active ? '#1a73e8' : '#555'}}>
                    {tier.label}
                  </p>
                  <p style={{margin: 0, fontSize: 12, color: '#999'}}>{tier.sms} SMS ανά παραλήπτη</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={{margin: 0, fontWeight: 'bold', color: tier.active ? '#1a73e8' : '#555'}}>
                    {(tier.sms * 0.09).toFixed(2)}€
                  </p>
                  <p style={{margin: 0, fontSize: 11, color: '#999'}}>ανά αριθμό</p>
                </div>
              </div>
            ))}

            <div style={{marginTop: 16, padding: 12, background: '#f8f9fa', borderRadius: 8, textAlign: 'center'}}>
              <p style={{margin: '0 0 4px', color: '#666', fontSize: 13}}>Τώρα χρεώνεστε</p>
              <p style={{margin: 0, fontSize: 24, fontWeight: 'bold', color: '#1a73e8'}}>
                {(smsPerRecipient * 0.09).toFixed(2)}€
              </p>
              <p style={{margin: 0, fontSize: 12, color: '#999'}}>ανά παραλήπτη</p>
            </div>
          </div>

        </div>
      )}

      {step === 2 && (
        <div style={{background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
          <h2>Βήμα 2: Ανέβασε τη λίστα τηλεφώνων</h2>
          <p style={{color: '#666'}}>Ανέβασε CSV αρχείο με τηλέφωνα πελατών (ένα ανά γραμμή)</p>

          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            style={{width: '100%', padding: 10, margin: '8px 0 16px', borderRadius: 8, border: '2px dashed #1a73e8', boxSizing: 'border-box'}}
          />

          {phones.length > 0 && (
            <div>
              <div style={{background: '#e8f5e9', padding: 16, borderRadius: 8, margin: '16px 0'}}>
                ✅ Βρέθηκαν <strong>{phones.length}</strong> τηλέφωνα
                {smsPerRecipient > 1 && <span style={{color: '#856404'}}> — {smsPerRecipient} SMS ανά παραλήπτη</span>}
              </div>

              <div style={{background: '#f8f9fa', padding: 20, borderRadius: 8, margin: '16px 0', textAlign: 'center'}}>
                <p style={{fontSize: 16, color: '#666', margin: '0 0 8px'}}>Σύνολο χρέωσης</p>
                <p style={{fontSize: 36, fontWeight: 'bold', color: '#1a73e8', margin: '0 0 4px'}}>
                  {finalAmount.toFixed(2)}€
                </p>
                {isMinimum
                  ? <p style={{color: '#999', margin: 0}}>Ελάχιστη χρέωση</p>
                  : <p style={{color: '#999', margin: 0}}>{phones.length} x {smsPerRecipient} SMS x 0.09€</p>
                }
              </div>
            </div>
          )}

          <div style={{display: 'flex', gap: 10}}>
            <button
              onClick={() => setStep(1)}
              style={{flex: 1, padding: 14, background: '#f5f5f5', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer'}}
            >
              ← Πίσω
            </button>
            <button
              onClick={handlePayment}
              disabled={phones.length === 0 || loading}
              style={{flex: 2, padding: 14, background: phones.length > 0 ? '#1a73e8' : '#ccc', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, cursor: phones.length > 0 ? 'pointer' : 'not-allowed'}}
            >
              {loading ? '⏳ Παρακαλώ περιμένετε...' : `💳 Πληρωμή ${finalAmount.toFixed(2)}€`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
