export default function Success() {
  return (
    <div style={{maxWidth: 500, margin: '100px auto', padding: 20, textAlign: 'center'}}>
      <div style={{background: 'white', padding: 40, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
        <div style={{fontSize: 64}}>🎉</div>
        <h1 style={{color: '#1a73e8'}}>Η πληρωμή ολοκληρώθηκε!</h1>
        <p style={{color: '#666', fontSize: 18}}>Τα SMS στέλνονται τώρα στους πελάτες σας!</p>
        <p style={{color: '#999'}}>Θα λάβετε επιβεβαίωση σύντομα.</p>
        <a href="/" style={{display: 'inline-block', marginTop: 20, padding: '14px 30px', background: '#1a73e8', color: 'white', borderRadius: 8, textDecoration: 'none', fontSize: 16}}>
          Νέα Καμπάνια
        </a>
      </div>
    </div>
  )
}
