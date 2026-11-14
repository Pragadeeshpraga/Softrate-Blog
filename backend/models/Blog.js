const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.Mixed, // Allows either an ObjectId reference or a String name (e.g., 'Admin')
    ref: "Author",
    default: null,
  },
  category: { type: String, required: true },
  tags: { type: [String], default: [] },
  thumbnail: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'published' },
  scheduledAt: { type: Date, default: null },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);