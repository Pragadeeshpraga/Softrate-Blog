import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '2.5rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Contact Us</h1>
      <p style={{ color: '#475569', marginBottom: '2rem' }}>
        Have a question, guest article pitch, or feedback for the Softrate editorial team? Send us a message below.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {/* Contact Information Card */}
        <div style={{ background: '#0f172a', color: '#e2e8f0', padding: '2rem', borderRadius: '8px' }}>
          <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Get in Touch</h3>
          <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', color: '#cbd5e1' }}>
            We welcome inquiries about software engineering, AI research, and technology collaborations.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
            <div>
              <strong style={{ color: '#38bdf8', display: 'block' }}>Email</strong>
              <span>editorial@softrate-blog.com</span>
            </div>
            <div>
              <strong style={{ color: '#38bdf8', display: 'block' }}>Phone</strong>
              <span>+91 98765 43210</span>
            </div>
            <div>
              <strong style={{ color: '#38bdf8', display: 'block' }}>Office Location</strong>
              <span>Chennai, Tamil Nadu, India</span>
            </div>
            <div>
              <strong style={{ color: '#38bdf8', display: 'block' }}>Working Hours</strong>
              <span>Mon – Fri: 9:30 AM – 6:30 PM IST</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {submitted && (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.9rem' }}>
              Thank you! Your message has been received by our team.
            </div>
          )}

          <input
            type="text"
            placeholder="Your Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Your Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            required
          />
          <textarea
            rows="5"
            placeholder="Write your message..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
          <button type="submit" style={{ background: '#2563eb', color: '#fff', fontWeight: '600' }}>
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}