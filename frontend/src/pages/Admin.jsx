import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const INITIAL_CATEGORIES = [
  'Software Development',
  'Artificial Intelligence & Machine Learning',
  'Web and Mobile App Development',
  'Technology & Innovation',
  'Cybersecurity',
  'Cloud Computing',
  'Industry Insights'
];

// Your actual Render backend URL
const API_URL = 'https://softrate-blog.onrender.com/api/blogs';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('softrate_admin') === 'true');
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editId, setEditId] = useState(null);
  
  const initialFormState = {
    title: '',
    author: '',
    category: INITIAL_CATEGORIES[0],
    description: '',
    content: '',
    thumbnail: '',
    tags: '',
    isFeatured: false,
    status: 'published',
    seoDescription: ''
  };

  const [form, setForm] = useState(initialFormState);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === 'admin123@gmail.com' && passcode === 'admin123') {
      sessionStorage.setItem('softrate_admin', 'true');
      setIsAuthenticated(true);
    } else {
      alert('Invalid email or password');
    }
  };

  const fetchBlogs = () => {
    axios.get(API_URL)
      .then((res) => setBlogs(res.data))
      .catch((err) => console.error('Fetch error:', err));
  };

  useEffect(() => {
    if (isAuthenticated) fetchBlogs();
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: typeof form.tags === 'string'
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : form.tags
    };

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, payload);
        setEditId(null);
      } else {
        await axios.post(API_URL, payload);
      }

      setForm(initialFormState);
      fetchBlogs();
      alert('Article saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to save: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (blog) => {
    setEditId(blog._id);
    setForm({
      title: blog.title,
      author: blog.author,
      category: blog.category,
      description: blog.description,
      content: blog.content || '',
      thumbnail: blog.thumbnail || '',
      tags: (blog.tags || []).join(', '),
      isFeatured: blog.isFeatured || false,
      status: blog.status || 'published',
      seoDescription: blog.seoDescription || ''
    });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(initialFormState);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchBlogs();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete article');
    }
  };

  const publishedCount = blogs.filter((b) => b.status === 'published').length;
  const draftCount = blogs.filter((b) => b.status === 'draft').length;
  const displayedBlogs = blogs.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
        <h2 style={{ marginBottom: '1rem' }}>Admin CMS Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email"
            placeholder="Admin Email (admin123@gmail.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
          <input
            type="password"
            placeholder="Password (admin123)"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
          <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '0.75rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto', padding: '0 1rem' }}>
      
      {/* HEADER SECTION WITH AUTHORS BUTTON & LOGOUT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>{editId ? 'Edit Article' : 'Publish New Article'}</h1>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/authors" style={{ background: '#0f172a', color: '#fff', textDecoration: 'none', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: '600' }}>
            Manage Authors
          </Link>
          <button onClick={() => { sessionStorage.removeItem('softrate_admin'); setIsAuthenticated(false); }} style={{ background: '#64748b', color: '#fff', padding: '0.6rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
            Logout
          </button>
        </div>
      </div>
      
      {/* FORM SECTION */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '3rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <input placeholder="Article Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}/>
        
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <input placeholder="Author Name" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} required />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            {INITIAL_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        
        <input placeholder="Thumbnail Image URL (optional)" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}/>
        <input placeholder="Short Excerpt / Summary" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}/>
        <textarea placeholder="Full Article Content" rows="6" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical' }}/>
        <input placeholder="Tags (comma-separated, e.g. React, MongoDB, Cloud)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}/>
        <input placeholder="SEO Meta Description" value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}/>
        
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} style={{ width: 'auto' }} />
            Featured Article
          </label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button type="submit" style={{ flex: 1, background: '#2563eb', color: '#fff', padding: '0.75rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            {editId ? 'Save Changes' : 'Save Article'}
          </button>
          {editId && (
            <button type="button" onClick={handleCancelEdit} style={{ flex: 1, background: '#e2e8f0', color: '#0f172a', padding: '0.75rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* FILTER BUTTONS & COUNTS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Manage Articles</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            style={{
              background: statusFilter === 'all' ? '#0f172a' : '#e2e8f0',
              color: statusFilter === 'all' ? '#fff' : '#0f172a',
              fontSize: '0.85rem',
              fontWeight: '600',
              padding: '0.4rem 0.8rem',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            All ({blogs.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            style={{
              background: statusFilter === 'published' ? '#16a34a' : '#dcfce7',
              color: statusFilter === 'published' ? '#fff' : '#166534',
              fontSize: '0.85rem',
              fontWeight: '600',
              padding: '0.4rem 0.8rem',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            style={{
              background: statusFilter === 'draft' ? '#ca8a04' : '#fef9c3',
              color: statusFilter === 'draft' ? '#fff' : '#854d0e',
              fontSize: '0.85rem',
              fontWeight: '600',
              padding: '0.4rem 0.8rem',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Drafts ({draftCount})
          </button>
        </div>
      </div>
      
      {/* ARTICLES LIST */}
      {displayedBlogs.map((b) => (
        <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '0.6rem' }}>
          <div>
            <strong>{b.title}</strong>
            <span style={{ marginLeft: '0.6rem', fontSize: '0.8rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: b.status === 'published' ? '#dcfce7' : '#fef9c3', color: b.status === 'published' ? '#166534' : '#854d0e' }}>
              {b.status}
            </span>
            {b.isFeatured && <span style={{ marginLeft: '0.4rem', fontSize: '0.8rem', color: '#2563eb' }}>★ Featured</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => handleEdit(b)} style={{ background: '#e2e8f0', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
            <button onClick={() => handleDelete(b._id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}