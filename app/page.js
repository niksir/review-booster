'use client'
import { useState } from 'react'

export default function Home() {
  const [step, setStep] = useState(1)
  const [gmbLink, setGmbLink] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [phones, setPhones] = useState([])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState(null)

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

  const handleSend = async () => {
    setSending(true)
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phones, gmbLink, businessName, message })
    })
    const data = await res.json()
    setResults(data)
    setSending(false)
    setStep(3)
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

          <label>Μήνυμα SMS (προαιρετικό)</label>
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
            <div style={{background: '#e8f5e9', padding: 12, borderRadius: 8, margin: '16px 0'}}>
              ✅ Βρέθηκαν <strong>{phones.length}</strong> τηλέφωνα έτοιμα για αποστολή
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
              onClick={handleSend}
              disabled={phones.length === 0 || sending}
              style={{flex: 2, padding: 14, background: phones.length > 0 ? '#1a73e8' : '#ccc', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, cursor: phones.length > 0 ? 'pointer' : 'not-allowed'}}
            >
              {sending ? '⏳ Αποστολή...' : `📤 Αποστολή σε ${phones.length} πελάτες`}
            </button>
          </div>
        </div>
      )}

      {step === 3 && results && (
        <div style={{background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center'}}>
          <h2>✅ Η αποστολή ολοκληρώθηκε!</h2>
          <div style={{fontSize: 48, margin: '20px 0'}}>🎉</div>
          <p style={{fontSize: 18}}>Στάλθηκαν <strong>{results.sent}</strong> SMS</p>
          {results.failed > 0 && <p style={{color: 'red'}}>Απέτυχαν: {results.failed}</p>}
          <button
            onClick={() => { setStep(1); setPhones([]); setResults(null) }}
            style={{padding: '14px 30px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer', marginTop: 20}}
          >
            Νέα Καμπάνια
          </button>
        </div>
      )}
    </div>
  )
}
