import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'https://softrate-blog.onrender.com/api';

const INITIAL_CATEGORIES = [
  'Software Development',
  'Artificial Intelligence & Machine Learning',
  'Web and Mobile App Development',
  'Technology & Innovation',
  'Cybersecurity',
  'Cloud Computing',
  'Industry Insights'
];

const INITIAL_AUTHOR_FORM = {
  name: '',
  role: '',
  bio: '',
  avatar: '',
  socialLinks: {
    twitter: '',
    linkedin: '',
    github: '',
    website: ''
  }
};

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('softrate_admin') === 'true'
  );
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');

  // Navigation tab: 'posts' | 'authors'
  const [activeTab, setActiveTab] = useState('posts');

  // Blogs state
  const [blogs, setBlogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editId, setEditId] = useState(null);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

  // Authors state
  const [authors, setAuthors] = useState([]);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [editingAuthorId, setEditingAuthorId] = useState(null);
  const [authorForm, setAuthorForm] = useState(INITIAL_AUTHOR_FORM);

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
    axios
      .get(`${API_BASE}/blogs?all=true`)
      .then((res) => setBlogs(res.data))
      .catch((err) => console.error('Error fetching blogs:', err));
  };

  const fetchAuthors = () => {
    axios
      .get(`${API_BASE}/authors`)
      .then((res) => setAuthors(Array.isArray(res.data) ? res.data : res.data.authors || []))
      .catch((err) => console.error('Error fetching authors:', err));
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBlogs();
      fetchAuthors();
    }
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
    if (!form.title.trim() || !form.description.trim() || !form.content.trim()) {
      alert('Please fill in Title, Short Excerpt, and Full Article Content.');
      return;
    }

    if (targetStatus === 'scheduled' && !form.scheduledAt) {
      alert('Please select a date and time to schedule this article.');
      return;
    }

    const payload = {
      ...form,
      author: form.author.trim() || 'Admin',
      status: targetStatus,
      scheduledAt: targetStatus === 'scheduled' ? new Date(form.scheduledAt).toISOString() : null,
      tags:
        typeof form.tags === 'string'
          ? form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : form.tags
    };

    try {
      if (editId) {
        await axios.put(`${API_BASE}/blogs/${editId}`, payload);
      } else {
        await axios.post(`${API_BASE}/blogs`, payload);
      }
      resetForm();
      fetchBlogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving article');
    }
  };

  const handleEdit = (blog) => {
    setActiveTab('posts');
    setEditId(blog._id);
    const localDateTime = blog.scheduledAt
      ? new Date(new Date(blog.scheduledAt).getTime() - new Date().getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
      : '';
    setShowSchedulePicker(blog.status === 'scheduled');
    setForm({
      title: blog.title,
      author: blog.author === 'Admin' ? '' : blog.author || '',
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
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    await axios.delete(`${API_BASE}/blogs/${id}`);
    fetchBlogs();
  };

  // ==================== AUTHOR HANDLERS ====================

  const openAddAuthorModal = () => {
    setEditingAuthorId(null);
    setAuthorForm(INITIAL_AUTHOR_FORM);
    setIsAuthorModalOpen(true);
  };

  const openEditAuthorModal = (author) => {
    setEditingAuthorId(author._id);
    setAuthorForm({
      name: author.name || '',
      role: author.role || '',
      bio: author.bio || '',
      avatar: author.avatar || '',
      socialLinks: {
        twitter: author.socialLinks?.twitter || '',
        linkedin: author.socialLinks?.linkedin || '',
        github: author.socialLinks?.github || '',
        website: author.socialLinks?.website || ''
      }
    });
    setIsAuthorModalOpen(true);
  };

  const closeAuthorModal = () => {
    setIsAuthorModalOpen(false);
    setEditingAuthorId(null);
    setAuthorForm(INITIAL_AUTHOR_FORM);
  };

  const handleSaveAuthor = async (e) => {
    e.preventDefault();
    if (!authorForm.name.trim()) {
      alert('Author name is required');
      return;
    }

    try {
      if (editingAuthorId) {
        await axios.put(`${API_BASE}/authors/${editingAuthorId}`, authorForm);
      } else {
        await axios.post(`${API_BASE}/authors`, authorForm);
      }
      fetchAuthors();
      closeAuthorModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save author');
    }
  };

  const handleDeleteAuthor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this author?')) return;
    try {
      await axios.delete(`${API_BASE}/authors/${id}`);
      fetchAuthors();
    } catch (err) {
      alert('Failed to delete author');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('softrate_admin');
    setIsAuthenticated(false);
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
      <div
        style={{
          maxWidth: '400px',
          margin: '4rem auto',
          padding: '2rem',
          background: '#fff',
          borderRadius: '8px',
          border: '1px solid #cbd5e1'
        }}
      >
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
          <button type="submit" style={{ background: '#2563eb', color: '#fff' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: '#f8fafc' }}>
      {/* Left Admin Sidebar */}
      <aside
        style={{
          width: '240px',
          background: '#1e2227',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem 1rem',
          flexShrink: 0
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem', paddingLeft: '0.5rem' }}>
            Admin Panel
          </h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveTab('posts')}
              style={{
                background: activeTab === 'posts' ? '#2563eb' : 'transparent',
                color: activeTab === 'posts' ? '#fff' : '#cbd5e1',
                border: 'none',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.95rem'
              }}
            >
              <span>📝</span> Dashboard / Posts
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('authors')}
              style={{
                background: activeTab === 'authors' ? '#2563eb' : 'transparent',
                color: activeTab === 'authors' ? '#fff' : '#cbd5e1',
                border: 'none',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.95rem'
              }}
            >
              <span>👥</span> Authors
            </button>

            <Link
              to="/"
              style={{
                color: '#cbd5e1',
                textDecoration: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.95rem'
              }}
            >
              <span>🌐</span> Public Site
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid #ef4444',
            color: '#ef4444',
            padding: '0.6rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '2rem 2.5rem', maxWidth: '1150px' }}>
        {activeTab === 'posts' ? (
          <>
            <h1 style={{ marginBottom: '0.25rem', color: '#0f172a' }}>
              {editId ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
            <p style={{ color: '#64748b', marginTop: 0, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Write and publish an engaging article for your readers.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.1rem',
                marginBottom: '3rem',
                background: '#fff',
                padding: '1.75rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}
            >
              {/* Blog Title */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.4rem'
                  }}
                >
                  BLOG TITLE *
                </label>
                <input
                  placeholder="e.g. Learning new technology to boost your career in software"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              {/* Category + Featured Image URL */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.4rem'
                    }}
                  >
                    CATEGORY *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#fff'
                    }}
                  >
                    {INITIAL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: '240px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.4rem'
                    }}
                  >
                    FEATURED IMAGE URL
                  </label>
                  <input
                    placeholder="https://... (optional)"
                    value={form.thumbnail}
                    onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                  />
                </div>
              </div>

              {/* AUTHOR DROPDOWN (Matches Screenshot 3) */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.4rem'
                  }}
                >
                  AUTHOR
                </label>
                <select
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    fontSize: '0.95rem',
                    color: '#0f172a'
                  }}
                >
                  <option value="">— No Author (Admin) —</option>
                  {authors.map((a) => (
                    <option key={a._id} value={a.name}>
                      {a.name} {a.role ? `— ${a.role}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Excerpt & Content */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.4rem'
                  }}
                >
                  SHORT EXCERPT / SUMMARY *
                </label>
                <input
                  placeholder="Short Excerpt / Summary *"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.4rem'
                  }}
                >
                  FULL ARTICLE CONTENT *
                </label>
                <textarea
                  placeholder="Full Article Content *"
                  rows="6"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>

              <input
                placeholder="Tags (comma-separated, e.g. React, MongoDB, Cloud)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />

              {/* SEO Metadata Box */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1rem',
                  background: '#f8fafc'
                }}
              >
                <strong style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                  SEO Metadata (Search Engine Optimization)
                </strong>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '0.8rem'
                  }}
                >
                  <input
                    placeholder="SEO Meta Title (Defaults to article title)"
                    value={form.seoTitle}
                    onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                  />
                  <input
                    placeholder="SEO Meta Description (Defaults to excerpt)"
                    value={form.seoDescription}
                    onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                  />
                </div>
              </div>

              {/* Featured Checkbox */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  Mark as Featured Article
                </label>
              </div>

              {/* Date & Time Picker when Schedule Article is clicked */}
              {showSchedulePicker && (
                <div
                  style={{
                    background: '#fefce8',
                    border: '1px solid #fde047',
                    padding: '1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <label style={{ fontWeight: '600', color: '#854d0e' }}>
                    Select Publish Date & Time:
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                    style={{
                      width: 'auto',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ca8a04'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => saveArticle('scheduled')}
                    style={{
                      background: '#eab308',
                      color: '#0f172a',
                      fontWeight: '700',
                      padding: '0.55rem 1.1rem'
                    }}
                  >
                    Confirm Schedule
                  </button>
                </div>
              )}

              {/* Action Buttons Row */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => saveArticle('published')}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    fontWeight: '600',
                    padding: '0.7rem 1.3rem',
                    borderRadius: '8px'
                  }}
                >
                  Publish Article Now
                </button>

                <button
                  type="button"
                  onClick={() => setShowSchedulePicker((prev) => !prev)}
                  style={{
                    background: '#f59e0b',
                    color: '#0f172a',
                    fontWeight: '600',
                    padding: '0.7rem 1.3rem',
                    borderRadius: '8px'
                  }}
                >
                  Schedule Article
                </button>

                <button
                  type="button"
                  onClick={() => saveArticle('draft')}
                  style={{
                    background: '#fff',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    fontWeight: '600',
                    padding: '0.7rem 1.3rem',
                    borderRadius: '8px'
                  }}
                >
                  Save as Draft
                </button>

                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      fontWeight: '600',
                      padding: '0.7rem 1.3rem',
                      borderRadius: '8px'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Manage Articles Header + Filter Badges */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1rem'
              }}
            >
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
              <div
                key={b._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.9rem',
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '0.6rem'
                }}
              >
                <div>
                  <strong>{b.title}</strong>
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.82rem', color: '#64748b' }}>
                    by {b.author || 'Admin'}
                  </span>
                  <span
                    style={{
                      marginLeft: '0.6rem',
                      fontSize: '0.8rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background:
                        b.status === 'published'
                          ? '#dcfce7'
                          : b.status === 'scheduled'
                          ? '#ffedd5'
                          : '#fef9c3',
                      color:
                        b.status === 'published'
                          ? '#166534'
                          : b.status === 'scheduled'
                          ? '#9a3412'
                          : '#854d0e'
                    }}
                  >
                    {b.status}
                  </span>
                  {b.status === 'scheduled' && b.scheduledAt && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#9a3412' }}>
                      ({new Date(b.scheduledAt).toLocaleString()})
                    </span>
                  )}
                  {b.isFeatured && (
                    <span style={{ marginLeft: '0.4rem', fontSize: '0.8rem', color: '#2563eb' }}>
                      ★ Featured
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(b)} style={{ background: '#e2e8f0' }}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    style={{ background: '#fee2e2', color: '#dc2626' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          /* ==================== AUTHORS PAGE (Matches Screenshot 2) ==================== */
          <div>
            {/* Authors Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '2rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a' }}>Authors</h1>
                </div>
                <p style={{ margin: '0.35rem 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                  Manage blog authors and contributors
                </p>
              </div>

              <button
                type="button"
                onClick={openAddAuthorModal}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  fontWeight: '600',
                  padding: '0.7rem 1.35rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                }}
              >
                + Add Author
              </button>
            </div>

            {/* Authors Cards Grid */}
            {authors.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  padding: '3rem',
                  textAlign: 'center',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  color: '#64748b'
                }}
              >
                No authors added yet. Click <strong>+ Add Author</strong> to create your first author profile.
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.5rem'
                }}
              >
                {authors.map((author) => (
                  <div
                    key={author._id}
                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      border: '1px solid #eef2f6',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Avatar + Name + Role */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          marginBottom: '1rem'
                        }}
                      >
                        <img
                          src={
                            author.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              author.name
                            )}&background=e2e8f0&color=334155`
                          }
                          alt={author.name}
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '1px solid #e2e8f0'
                          }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '1.05rem',
                              fontWeight: '700',
                              color: '#0f172a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {author.name}
                          </h3>
                          <p
                            style={{
                              margin: '0.2rem 0 0',
                              fontSize: '0.82rem',
                              fontWeight: '600',
                              color: '#2563eb',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {author.role || 'Contributor'}
                          </p>
                        </div>
                      </div>

                      {/* Bio */}
                      <p
                        style={{
                          fontSize: '0.88rem',
                          color: '#475569',
                          lineHeight: 1.5,
                          margin: '0 0 1.25rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '2.6rem'
                        }}
                      >
                        {author.bio || 'No biography provided.'}
                      </p>

                      {/* Social Icons Row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1.1rem',
                          marginBottom: '1.25rem',
                          color: '#475569'
                        }}
                      >
                        {/* X / Twitter */}
                        <a
                          href={author.socialLinks?.twitter || '#'}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: '#475569',
                            opacity: author.socialLinks?.twitter ? 1 : 0.4,
                            pointerEvents: author.socialLinks?.twitter ? 'auto' : 'none'
                          }}
                          title="Twitter / X"
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </a>

                        {/* LinkedIn */}
                        <a
                          href={author.socialLinks?.linkedin || '#'}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: '#475569',
                            opacity: author.socialLinks?.linkedin ? 1 : 0.4,
                            pointerEvents: author.socialLinks?.linkedin ? 'auto' : 'none'
                          }}
                          title="LinkedIn"
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                          </svg>
                        </a>

                        {/* GitHub */}
                        <a
                          href={author.socialLinks?.github || '#'}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: '#475569',
                            opacity: author.socialLinks?.github ? 1 : 0.4,
                            pointerEvents: author.socialLinks?.github ? 'auto' : 'none'
                          }}
                          title="GitHub"
                        >
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                          </svg>
                        </a>

                        {/* Website */}
                        <a
                          href={author.socialLinks?.website || '#'}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: '#475569',
                            opacity: author.socialLinks?.website ? 1 : 0.4,
                            pointerEvents: author.socialLinks?.website ? 'auto' : 'none'
                          }}
                          title="Website"
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        </a>
                      </div>
                    </div>

                    {/* Edit / Delete Footer */}
                    <div
                      style={{
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '0.85rem',
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => openEditAuthorModal(author)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#475569',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.5rem'
                        }}
                      >
                        <span>✏️</span> Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAuthor(author._id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '0.82rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.5rem'
                        }}
                      >
                        <span>🗑️</span> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================== ADD / EDIT AUTHOR MODAL (Matches Screenshot 1) ==================== */}
      {isAuthorModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '520px',
              padding: '1.75rem 2rem',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>
                {editingAuthorId ? 'Edit Author' : 'Add New Author'}
              </h2>
              <button
                type="button"
                onClick={closeAuthorModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.35rem',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0.2rem 0.4rem',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveAuthor} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Name & Role Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      color: '#334155',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '0.4rem'
                    }}
                  >
                    NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={authorForm.name}
                    onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      color: '#334155',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '0.4rem'
                    }}
                  >
                    ROLE
                  </label>
                  <input
                    type="text"
                    placeholder="Senior Developer"
                    value={authorForm.role}
                    onChange={(e) => setAuthorForm({ ...authorForm, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    color: '#334155',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '0.4rem'
                  }}
                >
                  BIO
                </label>
                <textarea
                  rows="3"
                  placeholder="A short biography about the author..."
                  value={authorForm.bio}
                  onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    color: '#334155',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '0.4rem'
                  }}
                >
                  AVATAR URL
                </label>
                <input
                  type="url"
                  placeholder="https://... (optional)"
                  value={authorForm.avatar}
                  onChange={(e) => setAuthorForm({ ...authorForm, avatar: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              {/* Social Links 2x2 Grid */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    color: '#334155',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '0.4rem'
                  }}
                >
                  SOCIAL LINKS
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="url"
                    placeholder="Twitter / X URL"
                    value={authorForm.socialLinks.twitter}
                    onChange={(e) =>
                      setAuthorForm({
                        ...authorForm,
                        socialLinks: { ...authorForm.socialLinks, twitter: e.target.value }
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.9rem'
                    }}
                  />
                  <input
                    type="url"
                    placeholder="LinkedIn URL"
                    value={authorForm.socialLinks.linkedin}
                    onChange={(e) =>
                      setAuthorForm({
                        ...authorForm,
                        socialLinks: { ...authorForm.socialLinks, linkedin: e.target.value }
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.9rem'
                    }}
                  />
                  <input
                    type="url"
                    placeholder="GitHub URL"
                    value={authorForm.socialLinks.github}
                    onChange={(e) =>
                      setAuthorForm({
                        ...authorForm,
                        socialLinks: { ...authorForm.socialLinks, github: e.target.value }
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.9rem'
                    }}
                  />
                  <input
                    type="url"
                    placeholder="Website URL"
                    value={authorForm.socialLinks.website}
                    onChange={(e) =>
                      setAuthorForm({
                        ...authorForm,
                        socialLinks: { ...authorForm.socialLinks, website: e.target.value }
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '0.85rem',
                  marginTop: '0.5rem'
                }}
              >
                <button
                  type="button"
                  onClick={closeAuthorModal}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#475569',
                    fontWeight: '600',
                    padding: '0.65rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.92rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.68rem 1.35rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <span>💾</span> {editingAuthorId ? 'Save Changes' : 'Create Author'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}