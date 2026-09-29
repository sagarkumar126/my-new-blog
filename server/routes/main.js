const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const jwt = require('jsonwebtoken');

// Homepage — SHOW ALL POSTS from all users
router.get('/', async (req, res) => {
  try {
    const token = req.cookies.token;
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (err) {
        return res.redirect('/admin');
      }
    } else {
      return res.redirect('/admin');
    }

    const perPage = 5;
    const page = parseInt(req.query.page) || 1;

    const data = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .lean()
      .exec();

    const count = await Post.countDocuments();
    const totalPages = Math.ceil(count / perPage);

    res.render('index', {
      data,
      current: page,
      totalPages: totalPages,
      currentRoute: '/',
      showAddButton: true,
      currentUserId: userId
    });
  } catch (error) {
    console.log(error);
  }
});

// Single post
router.get('/post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) return res.status(404).send('Post not found');
    res.render('post', { data: post, currentRoute: `/post/${req.params.id}` });
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
});

// Search
router.post('/search', async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
        { Body: { $regex: new RegExp(searchNoSpecialChar, 'i') } },
      ]
    }).populate('author', 'username');
    res.render("search", { data, searchTerm, currentRoute: '/search' });
  } catch (error) {
    console.log(error);
  }
});

router.get('/about', (req, res) => {
  res.render('about', { currentRoute: '/about' });
});

router.get('/contact', (req, res) => {
  res.render('contact', { currentRoute: '/contact' });
});

module.exports = router;