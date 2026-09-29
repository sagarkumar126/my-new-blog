const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/admin');
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.redirect('/admin');
  }
};

// Show login page (with Google button)
router.get('/admin', async (req, res) => {
  try {
    const error = req.query.error || null;
    res.render('admin/index', {
      layout: adminLayout,
      currentRoute: '/admin',
      error
    });
  } catch (error) {
    console.log(error);
  }
});

// Dashboard - ONLY YOUR POSTS (with pagination)
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const perPage = 5;
    const page = parseInt(req.query.page) || 1;

    const data = await Post.find({ author: req.userId })
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments({ author: req.userId });
    const totalPages = Math.ceil(count / perPage);

    res.render('admin/dashboard', {
      data,
      current: page,
      totalPages: totalPages,
      layout: adminLayout,
      currentRoute: '/dashboard',
    });
  } catch (error) {
    console.log(error);
  }
});

// Add post page
router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const data = await Post.find({ author: req.userId });
    res.render('admin/add-post', {
      data,
      layout: adminLayout,
      currentRoute: '/add-post',
    });
  } catch (error) {
    console.log(error);
  }
});

// Create new post
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      Body: req.body.body,
      author: req.userId
    });
    await Post.create(newPost);
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});

// Edit post page - only if you are the author
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Post not found');

    if (post.author.toString() !== req.userId) {
      return res.status(403).send('You cannot edit this post');
    }

    res.render('admin/edit-post', {
      data: post,
      layout: adminLayout,
      currentRoute: '/edit-post',
    });
  } catch (error) {
    console.log(error);
  }
});

// Update post - only if you are the author
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.author.toString() !== req.userId) {
      return res.status(403).send('You cannot update this post');
    }

    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      Body: req.body.body,
      updatedAt: Date.now(),
    });

    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }
});

// Delete post - only if you are the author
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.author.toString() !== req.userId) {
      return res.status(403).send('You cannot delete this post');
    }

    await Post.deleteOne({ _id: req.params.id });
    res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  req.logout(() => {
    res.redirect('/');
  });
});

// Redirect old /register URL to /admin (since Google handles registration)
router.get('/register', (req, res) => {
  res.redirect('/admin');
});

module.exports = router;





