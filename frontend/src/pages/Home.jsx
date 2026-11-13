import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BlogCard from '../components/BlogCard';

// Your actual Render backend URL
const API_URL = 'https://softrate-blog.onrender.com/api/blogs';

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    axios.get(API_URL)
      .then((res) => setBlogs(res.data))
      .catch((err) => console.error('Error fetching blogs:', err));
  }, []);

  const featuredBlogs = blogs.filter((b) => b.isFeatured);
  const categories = ['All', ...new Set(blogs.map((b) => b.category))];

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Featured Articles Section */}
      {featuredBlogs.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Featured Articles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {featuredBlogs.slice(0, 2).map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        </section>
      )}

      {/* Search & Category Filter */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Latest Articles</h2>
          <Link to="/blogs" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>View All →</Link>
        </div>

        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: '1rem', width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#2563eb' : '#e2e8f0',
                color: selectedCategory === cat ? '#fff' : '#0f172a',
                fontSize: '0.85rem'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredBlogs.slice(0, 6).map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      </section>
    </div>
  );
}