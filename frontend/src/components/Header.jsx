import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#0f172a', color: '#fff' }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: '1.3rem', fontWeight: 'bold' }}>
        Softrate Tech Blog
      </Link>
      <nav style={{ display: 'flex', gap: '1.5rem' }}>
        <Link to="/" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Home</Link>
        <Link to="/blogs" style={{ color: '#e2e8f0', textDecoration: 'none' }}>All Articles</Link>
        <Link to="/contact" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Contact</Link>
        <Link to="/admin" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '600' }}>Admin </Link>

      </nav>
    </header>
  );
}