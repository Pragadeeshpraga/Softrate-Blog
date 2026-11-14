require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Blog = require('./models/Blog');
const Aythor = require('./models/Author');
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



// GET all blogs (auto-publishes due scheduled posts; filters out drafts/future scheduled unless ?all=true)
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
// GET single blog by SEO slug
app.get('/api/blogs/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ message: 'Article not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new blog
app.post('/api/blogs', async (req, res) => {
  try {
    const baseSlug = req.body.slug ? createSlug(req.body.slug) : createSlug(req.body.title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const newBlog = new Blog({
      ...req.body,
      slug: uniqueSlug
    });
    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update an existing blog by ID
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

// DELETE a blog by ID
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET all authors
app.get('/api/authors', async (req, res) => {
  try {
    const authors = await Author.find().sort({ createdAt: -1 });
    res.json(authors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new author
app.post('/api/authors', async (req, res) => {
  try {
    const newAuthor = new Author(req.body);
    const savedAuthor = await newAuthor.save();
    res.status(201).json(savedAuthor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an author by ID
app.delete('/api/authors/:id', async (req, res) => {
  try {
    await Author.findByIdAndDelete(req.params.id);
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