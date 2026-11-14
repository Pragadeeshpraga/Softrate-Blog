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

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('softrate_admin') === 'true');
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editId, setEditId] = useState(null);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

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
    scheduledAt: '',
    seoTitle: '',
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
    axios.get('http://localhost:5000/api/blogs?all=true')
      .then((res) => setBlogs(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (isAuthenticated) fetchBlogs();
  }, [isAuthenticated]);

  const resetForm = () => {
    setEditId(null);
    setShowSchedulePicker(false);
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
      scheduledAt: '',
      seoTitle: '',
      seoDescription: ''
    });
  };

  const saveArticle = async (targetStatus) => {
    if (!form.title.trim() || !form.author.trim() || !form.description.trim() || !form.content.trim()) {
      alert('Please fill in Title, Author, Short Excerpt, and Full Article Content.');
      return;
    }

    if (targetStatus === 'scheduled' && !form.scheduledAt) {
      alert('Please select a date and time to schedule this article.');
      return;
    }

    const payload = {
      ...form,
      status: targetStatus,
      scheduledAt: targetStatus === 'scheduled' ? new Date(form.scheduledAt).toISOString() : null,
      tags: typeof form.tags === 'string'
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : form.tags
    };

    if (editId) {
      await axios.put(`http://localhost:5000/api/blogs/${editId}`, payload);
    } else {
      await axios.post('http://localhost:5000/api/blogs', payload);
    }

    resetForm();
    fetchBlogs();
  };

  const handleEdit = (blog) => {
    setEditId(blog._id);
    const localDateTime = blog.scheduledAt
      ? new Date(new Date(blog.scheduledAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : '';
    setShowSchedulePicker(blog.status === 'scheduled');
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
      scheduledAt: localDateTime,
      seoTitle: blog.seoTitle || '',
      seoDescription: blog.seoDescription || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/blogs/${id}`);
    fetchBlogs();
  };

  const publishedCount = blogs.filter((b) => b.status === 'published').length;
  const scheduledCount = blogs.filter((b) => b.status === 'scheduled').length;
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
    <div style={{ maxWidth: '880px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>{editId ? 'Edit Article' : 'Publish New Article'}</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/authors" style={{ background: '#0f172a', color: '#fff', textDecoration: 'none', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: '600' }}>
            Manage Authors
          </Link>
          <button onClick={() => { sessionStorage.removeItem('softrate_admin'); setIsAuthenticated(false); }} style={{ background: '#64748b', color: '#fff' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '3rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <input placeholder="Article Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <input placeholder="Author Name *" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} style={{ flex: 1 }} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            {INITIAL_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <input placeholder="Thumbnail Image URL (optional)" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
        <input placeholder="Short Excerpt / Summary *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <textarea placeholder="Full Article Content *" rows="6" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <input placeholder="Tags (comma-separated, e.g. React, MongoDB, Cloud)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />

        {/* SEO Metadata Box */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#f8fafc' }}>
          <strong style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem' }}>SEO Metadata (Search Engine Optimization)</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.8rem' }}>
            <input placeholder="SEO Meta Title (Defaults to article title)" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
            <input placeholder="SEO Meta Description (Defaults to excerpt)" value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
          </div>
        </div>

        {/* Featured Checkbox */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600' }}>
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} style={{ width: 'auto' }} />
            Mark as Featured Article
          </label>
        </div>

        {/* Date & Time Picker when Schedule Article is clicked */}
        {showSchedulePicker && (
          <div style={{ background: '#fefce8', border: '1px solid #fde047', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: '600', color: '#854d0e' }}>Select Publish Date & Time:</label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              style={{ width: 'auto', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ca8a04' }}
            />
            <button
              type="button"
              onClick={() => saveArticle('scheduled')}
              style={{ background: '#eab308', color: '#0f172a', fontWeight: '700', padding: '0.55rem 1.1rem' }}
            >
              Confirm Schedule
            </button>
          </div>
        )}

        {/* Action Buttons Row matching your screenshot */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => saveArticle('published')}
            style={{ background: '#0d6efd', color: '#fff', fontWeight: '600', padding: '0.7rem 1.3rem', borderRadius: '6px' }}
          >
            Publish Article Now
          </button>

          <button
            type="button"
            onClick={() => setShowSchedulePicker((prev) => !prev)}
            style={{ background: '#f59e0b', color: '#0f172a', fontWeight: '600', padding: '0.7rem 1.3rem', borderRadius: '6px' }}
          >
            Schedule Article
          </button>

          <button
            type="button"
            onClick={() => saveArticle('draft')}
            style={{ background: '#fff', color: '#334155', border: '1px solid #cbd5e1', fontWeight: '600', padding: '0.7rem 1.3rem', borderRadius: '6px' }}
          >
            Save as Draft
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              style={{ background: '#f1f5f9', color: '#475569', fontWeight: '600', padding: '0.7rem 1.3rem', borderRadius: '6px' }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Manage Articles Header + Filter Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Manage Articles</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
            onClick={() => setStatusFilter('scheduled')}
            style={{
              background: statusFilter === 'scheduled' ? '#d97706' : '#ffedd5',
              color: statusFilter === 'scheduled' ? '#fff' : '#9a3412',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            Scheduled ({scheduledCount})
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
            <span
              style={{
                marginLeft: '0.6rem',
                fontSize: '0.8rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                background: b.status === 'published' ? '#dcfce7' : b.status === 'scheduled' ? '#ffedd5' : '#fef9c3',
                color: b.status === 'published' ? '#166534' : b.status === 'scheduled' ? '#9a3412' : '#854d0e'
              }}
            >
              {b.status}
            </span>
            {b.status === 'scheduled' && b.scheduledAt && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#9a3412' }}>
                ({new Date(b.scheduledAt).toLocaleString()})
              </span>
            )}
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