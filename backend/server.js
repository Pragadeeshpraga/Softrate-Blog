require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Blog = require('./models/Blog');
const Author = require('./models/Author');
const app = express();

app.use(cors());
app.use(express.json());

const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ==================== BLOG ROUTES ====================

app.get('/api/blogs', async (req, res) => {
  try {
    await Blog.updateMany(
      { status: 'scheduled', scheduledAt: { $lte: new Date() } },
      { $set: { status: 'published' } }
    );

    const filter = req.query.all === 'true' ? {} : { status: 'published' };
    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/blogs/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ message: 'Article not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/blogs', async (req, res) => {
  try {
    const baseSlug = req.body.slug ? createSlug(req.body.slug) : createSlug(req.body.title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const newBlog = new Blog({
      ...req.body,
      author: req.body.author || 'Admin',
      slug: uniqueSlug
    });
    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/blogs/:id', async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedBlog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/blogs/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==================== AUTHOR ROUTES ====================

app.get('/api/authors', async (req, res) => {
  try {
    const authors = await Author.find().sort({ createdAt: -1 });
    res.json(authors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/authors', async (req, res) => {
  try {
    const { name, role, bio, avatar, socialLinks } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Author name is required' });
    }

    const newAuthor = new Author({
      name,
      role,
      bio,
      avatar,
      socialLinks
    });
    const savedAuthor = await newAuthor.save();
    res.status(201).json(savedAuthor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/authors/:id', async (req, res) => {
  try {
    const identifier = req.params.id;
    // Check if it's a valid MongoDB ObjectId, otherwise search by name
    const query = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { name: identifier };

    const updatedAuthor = await Author.findOneAndUpdate(
      query,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAuthor) return res.status(404).json({ message: 'Author not found' });
    res.json(updatedAuthor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/authors/:id', async (req, res) => {
  try {
    const identifier = req.params.id;
    // Check if it's a valid MongoDB ObjectId, otherwise search by name
    const query = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { name: identifier };

    const deleted = await Author.findOneAndDelete(query);
    if (!deleted) return res.status(404).json({ message: 'Author not found' });
    res.json({ message: 'Author deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('DB Error:', err));