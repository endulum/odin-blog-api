import Author from '../models/author';
import Post from '../models/post';
import Comment from '../models/comment';

import express from "express";

const router = express.Router();

// all authors
router.route('/authors')
  .get(async (req, res, next) => {
    const authors = await Author.find({}).exec();
    res.send(authors);
  });

// one author by id
router.route('/author/:id')
  .get(async (req, res, next) => {
    let author;
    try { author = await Author.findById(req.params.id) }
    // todo: not exactly "practical" to identify authors by id? why not some other more memorable identifier? possibly Firstname_Lastname
    catch { author = null }

    if (author === null) {
      const err = new Error('Author not found.');
      err.status = 404;
      return next(err);
      // todo: send some other kind of error? this won't necessarily be a webpage?
    } else {
      res.send(author);
    }
  });

// all posts by author
router.route('/author/:id/posts')
  .get(async (req, res, next) => {
    // duplicate 'find author if it exists' code, how to not do that?
    let author;
    try { author = await Author.findById(req.params.id).populate('posts').exec() }
    catch { author = null }

    if (author === null) {
      const err = new Error('Author not found.');
      err.status = 404;
      return next(err);
    } else {
      res.send(author.posts);
    }
  });

// all posts
router.route('/posts')
  .get(async (req, res, next) => {
    const posts = await Post.find({}).exec();
    res.send(posts);
  });

// one post by id
router.route('/post/:id')
  .get(async (req, res, next) => {
    let post;
    try { post = await Post.findById(req.params.id) }
    // todo: not exactly "practical" to identify posts by id? why not some other more memorable identifier? possibly Firstname_Lastname
    catch { post = null }

    if (post === null) {
      const err = new Error('Post not found.');
      err.status = 404;
      return next(err);
      // todo: should i send some other kind of error? this won't necessarily be a webpage?
    } else {
      res.send(post);
    }
  });

// all comments under post
router.route('/post/:id/comments')
  .get(async (req, res, next) => {
    let post;
    try { post = await Post.findById(req.params.id).populate('comments').exec() }
    // todo: not exactly "practical" to identify posts by id? why not some other more memorable identifier? possibly Firstname_Lastname
    catch { post = null }

    if (post === null) {
      const err = new Error('Post not found.');
      err.status = 404;
      return next(err);
      // todo: should i send some other kind of error? this won't necessarily be a webpage?
    } else {
      res.send(post.comments);
    }
  });

export default router;