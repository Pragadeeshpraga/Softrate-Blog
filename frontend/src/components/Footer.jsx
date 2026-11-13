import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#cbd5e1', padding: '2.5rem 2rem', marginTop: '4rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Softrate Technology</h3>
          <p style={{ maxWidth: '320px', fontSize: '0.9rem' }}>
            Insights, tutorials, and engineering updates on modern software, AI, and cloud architecture.
          </p>
        </div>
        <div>
          <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
            <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Home</Link>
            <Link to="/blogs" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Browse Articles</Link>
            <Link to="/admin" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Admin Portal</Link>
          </div>
        </div>
        <div>
          <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Connect</h4>
          <p style={{ fontSize: '0.9rem' }}>LinkedIn • GitHub • X (Twitter)</p>
        </div>
      </div>
    </footer>
  );
}