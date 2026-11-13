import { Link } from 'react-router-dom';

export default function BlogCard({ blog }) {
  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
     <img
        src={blog.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'}
        alt={blog.title}
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800';
        }}
        style={{ width: '100%', height: '180px', objectFit: 'cover' }}
      />
      <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span style={{ alignSelf: 'flex-start', fontSize: '0.75rem', fontWeight: '600', background: '#eff6ff', color: '#2563eb', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
          {blog.category}
        </span>
        <h3 style={{ margin: '0.6rem 0', fontSize: '1.15rem' }}>{blog.title}</h3>
        <p style={{ color: '#475569', fontSize: '0.92rem', flex: 1 }}>{blog.description}</p>
        <div style={{ marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          <span>{blog.author} • {formattedDate}</span>
          <Link to={`/blog/${blog.slug}`} style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            Read →
          </Link>
        </div>
      </div>
    </article>
  );
}