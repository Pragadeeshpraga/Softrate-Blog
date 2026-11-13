import { useEffect, useState } from 'react';
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
  const [form, setForm] = useState({
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
  });

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

      setForm({
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
      });
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

  const handleDelete = async (id) => {
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
          />
          <input
            type="password"
            placeholder="Password (admin123)"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            required
          />
          <button type="submit" style={{ background: '#2563eb', color: '#fff' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>{editId ? 'Edit Article' : 'Publish New Article'}</h1>
        <button onClick={() => { sessionStorage.removeItem('softrate_admin'); setIsAuthenticated(false); }} style={{ background: '#64748b', color: '#fff' }}>
          Logout
        </button>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '3rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <input placeholder="Article Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <input placeholder="Author Name" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} style={{ flex: 1 }} required />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            {INITIAL_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <input placeholder="Thumbnail Image URL (optional)" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
        <input placeholder="Short Excerpt / Summary" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <textarea placeholder="Full Article Content" rows="6" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
        <input placeholder="Tags (comma-separated, e.g. React, MongoDB, Cloud)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        <input placeholder="SEO Meta Description" value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
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
        <button type="submit" style={{ background: '#2563eb', color: '#fff' }}>
          {editId ? 'Save Changes' : 'Save Article'}
        </button>
      </form>
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
              fontWeight: '600'
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
              fontWeight: '600'
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
              fontWeight: '600'
            }}
          >
            Drafts ({draftCount})
          </button>
        </div>
      </div>
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
            <button onClick={() => handleEdit(b)} style={{ background: '#e2e8f0' }}>Edit</button>
            <button onClick={() => handleDelete(b._id)} style={{ background: '#fee2e2', color: '#dc2626' }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}