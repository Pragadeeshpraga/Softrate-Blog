import { useEffect, useState } from 'react';
import axios from 'axios';
import BlogCard from '../components/BlogCard';

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    axios.get('http://localhost:5000/api/blogs')
      .then((res) => setBlogs(res.data))
      .catch((err) => console.error(err));
  }, []);

  const categories = ['All', ...new Set(blogs.map((b) => b.category))];

  const filtered = blogs.filter((b) => {
    const matchQuery = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || b.category === category;
    return matchQuery && matchCat;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}>All Technology Articles</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by keyword or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 2, minWidth: '220px' }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ flex: 1, minWidth: '180px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filtered.slice(0, visibleCount).map((blog) => (
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </div>

      {visibleCount < filtered.length && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={() => setVisibleCount((prev) => prev + 6)} style={{ background: '#0f172a', color: '#fff' }}>
            Load More Articles
          </button>
        </div>
      )}
    </div>
  );
}