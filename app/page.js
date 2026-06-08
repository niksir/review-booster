'use client'
import { useState } from 'react'

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
        body: JSON.stringify({ phones, gmbLink, businessName, message })
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
    <div style={{maxWidth: 600, margin: '40px auto', padding: 20}}>
      <h1 style={{color: '#1a73e8', textAlign: 'center'}}>⭐ Review Booster</h1>

      {step === 1 && (
        <div style={{background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
          <h2>Βήμα 1: Στοιχεία Επιχείρησης</h2>

          <label>Όνομα Επιχείρησης</label>
          <input
            style={{width: '100%', padding: 10, margin: '8px 0 16px', borderRadius: 8, border: '1px solid #ddd', boxSizing: 'border-box'}}
            placeholder="π.χ. Ταβέρνα Ο Νίκος"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
          />

          <label>Google My Business Link</label>
          <input
            style={{width: '100%', padding: 10, margin: '8px 0 16px', borderRadius: 8, border: '1px solid #ddd', boxSizing: 'border-box'}}
            placeholder="https://g.page/r/..."
            value={gmbLink}
            onChange={e => setGmbLink(e.target.value)}
          />

          <label>Μήνυμα SMS</label>
          <textarea
            style={{width: '100%', padding: 10, margin: '8px 0 16px', borderRadius: 8, border: '1px solid #ddd', boxSizing: 'border-box', height: 80}}
            placeholder="Σας ευχαριστούμε! Θα μας βοηθούσατε με μια κριτική:"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />

          <button
            onClick={() => setStep(2)}
            disabled={!businessName || !gmbLink}
            style={{width: '100%', padding: 14, background: businessName && gmbLink ? '#1a73e8' : '#ccc', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, cursor: businessName && gmbLink ? 'pointer' : 'not-allowed'}}
          >
            Επόμενο →
          </button>
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
              </div>

              <div style={{background: '#f8f9fa', padding: 20, borderRadius: 8, margin: '16px 0', textAlign: 'center'}}>
                <p style={{fontSize: 16, color: '#666', margin: '0 0 8px'}}>Σύνολο χρέωσης</p>
                <p style={{fontSize: 36, fontWeight: 'bold', color: '#1a73e8', margin: '0 0 4px'}}>
                  {(phones.length * 0.09).toFixed(2)}€
                </p>
                <p style={{color: '#999', margin: 0}}>{phones.length} SMS x 0.09€</p>
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
              {loading ? '⏳ Παρακαλώ περιμένετε...' : `💳 Πληρωμή ${(phones.length * 0.09).toFixed(2)}€`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
