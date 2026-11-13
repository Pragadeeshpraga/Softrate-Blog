import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import BlogCard from '../components/BlogCard';

export default function BlogDetails() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);

  useEffect(() => {
    axios.get(`http://onrender.com/api/blogs/${slug}`)
      .then((res) => setBlog(res.data))
      .catch((err) => console.error(err));

    axios.get('http://onrender.com/api/blogs')
      .then((res) => setAllBlogs(res.data))
      .catch((err) => console.error(err));
  }, [slug]);

  if (!blog) return <p style={{ padding: '2rem', textAlign: 'center' }}>Loading article...</p>;

  const wordCount = (blog.content || blog.description).split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const currentIndex = allBlogs.findIndex((b) => b.slug === blog.slug);
  const prevBlog = currentIndex > 0 ? allBlogs[currentIndex - 1] : null;
  const nextBlog = currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : null;
  const relatedBlogs = allBlogs.filter((b) => b.category === blog.category && b.slug !== blog.slug).slice(0, 2);

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <Link to="/blogs" style={{ color: '#2563eb', textDecoration: 'none' }}>← Back to Articles</Link>

      <div style={{ marginTop: '1rem' }}>
        <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600' }}>
          {blog.category}
        </span>
        <h1 style={{ margin: '0.8rem 0', fontSize: '2rem' }}>{blog.title}</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          By <strong>{blog.author}</strong> • {new Date(blog.createdAt).toLocaleDateString()} • {readingTime} min read
        </p>
      </div>

      {blog.thumbnail && (
        <img src={blog.thumbnail} alt={blog.title} referrerPolicy="no-referrer"
        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', margin: '1.5rem 0' }} />
      )}

      <div style={{ whiteSpace: 'pre-line', fontSize: '1.05rem', lineHeight: '1.8', color: '#1e293b', marginTop: '1.5rem' }}>
        {blog.content}
      </div>

      {blog.tags && blog.tags.length > 0 && (
        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {blog.tags.map((tag, i) => (
            <span key={i} style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Share & Navigation */}
      <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          {prevBlog && <Link to={`/blog/${prevBlog.slug}`}>← Previous: {prevBlog.title}</Link>}
        </div>
        <div>
          {nextBlog && <Link to={`/blog/${nextBlog.slug}`}>Next: {nextBlog.title} →</Link>}
        </div>
      </div>

      {/* Related Articles */}
      {relatedBlogs.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Related Articles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {relatedBlogs.map((rel) => <BlogCard key={rel._id} blog={rel} />)}
          </div>
        </section>
      )}
    </div>
  );
}