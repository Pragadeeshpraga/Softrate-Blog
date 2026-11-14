import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Authors() {
  const navigate = useNavigate();
  const isAuthenticated = sessionStorage.getItem('softrate_admin') === 'true';

  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', bio: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }
    fetchAuthors();
  }, [isAuthenticated, navigate]);

  const fetchAuthors = () => {
    axios.get('http://localhost:5000/api/authors')
      .then((res) => setAuthors(res.data))
      .catch((err) => console.error(err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5000/api/authors', form);
      setForm({ name: '', email: '', bio: '' });
      fetchAuthors();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add author (email may already exist)');
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/authors/${id}`);
    fetchAuthors();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('softrate_admin');
    navigate('/admin');
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: '#f8fafc' }}>
      {/* Left Admin Sidebar */}
      <aside style={{ width: '240px', background: '#1e2227', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem 1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', paddingLeft: '0.5rem' }}>Admin Panel</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/admin" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '0.7rem 1rem', borderRadius: '6px' }}>
              Dashboard / Posts
            </Link>
            <Link to="/authors" style={{ background: '#0d6efd', color: '#fff', textDecoration: 'none', padding: '0.7rem 1rem', borderRadius: '6px', fontWeight: '600' }}>
              Authors
            </Link>
            <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '0.7rem 1rem', borderRadius: '6px' }}>
              View Website
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '2rem 2.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#0f172a' }}>Author Management</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Card: Add New Author */}
          <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '1.2rem', fontSize: '1.15rem' }}>Add New Author</h3>

            {error && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.6rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  Author Name *
                </label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="author@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  Bio / Role
                </label>
                <textarea
                  rows="4"
                  placeholder="Author biography or job title"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <button
                type="submit"
                style={{ background: '#0d6efd', color: '#fff', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
              >
                Add Author
              </button>
            </form>
          </div>

          {/* Right Card: All Authors Table */}
          <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '1.2rem', fontSize: '1.15rem' }}>All Authors ({authors.length})</h3>

            {authors.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>No authors added yet. Create your first author on the left.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '0.75rem' }}>Name</th>
                      <th style={{ padding: '0.75rem' }}>Email</th>
                      <th style={{ padding: '0.75rem' }}>Bio</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authors.map((author) => (
                      <tr key={author._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 0.75rem', fontWeight: '600', color: '#0f172a' }}>
                          👤 {author.name}
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem', color: '#475569' }}>
                          {author.email}
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem', color: '#475569' }}>
                          {author.bio || '-'}
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDelete(author._id)}
                            style={{
                              background: '#fff',
                              color: '#ef4444',
                              border: '1px solid #fca5a5',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}