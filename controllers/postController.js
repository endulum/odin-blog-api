import Post from '../models/post';
import Author from '../models/author';
import Comment from '../models/comment';
import loginController from './loginController';

import asyncHandler from "express-async-handler";
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs/dist/bcrypt';
import mongoose from 'mongoose';

async function findPost(id) {
  // console.log(id);
  let post;
  if (mongoose.isValidObjectId(id)) post = await Post.findById(id).exec();
  else post = await Post.findOne({ title: id.split('_').join(' ') }).exec();
  return post;
}

const postController = {};

postController.getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({}).exec();
  const postJSON = await Promise.all(posts.map(async post => {
    const author = await Author.findById(post.author);
    return {
      authorId: post.author,
      authorName: author.penName,
      authorUsername: author.username,
      title: post.title,
      subtitle: post.subtitle,
      text: post.text,
      timestamp: post.timestamp,
      commentAmount: post.comments.length
    }
  }));
  res.json(postJSON)
});

postController.newPost = [
  loginController.authenticateToken,

  body('title')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a title.').bail()
    .isLength({ min: 2, max: 64 }).withMessage('Post titles must be between 2 and 64 characters long.')
    .matches(/^[A-Za-z0-9 ]+$/).withMessage('Title contains invalid characters.')
    .custom(async (value, { req }) => {
      const existingPost = await Post.findOne({ title: req.body.title });
      return existingPost === null ? true : Promise.reject()
    }).withMessage('A post with this title already exists.')
    .escape(),
  
  body('subtitle')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a subtitle.').bail()
    .isLength({ min: 2, max: 64 }).withMessage('Post subtitles must be between 2 and 64 characters long.')
    .escape(),

  body('text')
    .trim()
    .isLength({ min: 1 }).withMessage('Cannot submit a blank post.')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errorsArray = validationResult(req).array();
    if (errorsArray.length > 0) return res.json({ errors: errorsArray });
    // console.log(req.user);
    await Post.create({
      author: req.user.userId,
      title: req.body.title,
      subtitle: req.body.subtitle,
      text: req.body.text
    });
    res.send('Success - go look in database');
  }),
]

postController.getPostById = asyncHandler(async (req, res, next) => {
  const post = await findPost(req.params.id);
  if (post === null) {
    const err = new Error('Post not found.');
    err.status = 404;
    return next(err);
  } else {
    const postAuthor = await Author.findById(post.author);
    const comments = await Promise.all(post.comments.map(async commentId => {
      const comment = await Comment.findById(commentId).exec();
      return {
        commentId: commentId,
        commenter: comment.commenterName,
        text: comment.text,
        timestamp: comment.timestamp
      }
    }))
    res.json({
      authorId: post.author,
      authorName: postAuthor.penName,
      authorUsername: postAuthor.username,
      title: post.title,
      subtitle: post.subtitle,
      text: post.text,
      timestamp: post.timestamp,
      comments
    });
  }
});

postController.editPost = [
  loginController.authenticateToken,

  body('title')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a title.').bail()
    .isLength({ min: 2, max: 64 }).withMessage('Post titles must be between 2 and 64 characters long.')
    .matches(/^[A-Za-z0-9 ]+$/).withMessage('Title contains invalid characters.')
    .custom(async (value, { req }) => {
      const existingPost = await findPost(req.params.id);
      return existingPost !== null ? true : Promise.reject();
    }).withMessage('Post not found.')
    .custom(async (value, { req }) => {
      const existingPost = await Post.findOne({ title: req.body.title });
      if (existingPost && existingPost.title === req.body.title) {
        const thisPost = await findPost(req.params.id);
        if (existingPost._id.toString() === thisPost._id.toString()) return true;
        return Promise.reject();
      } else return true;
    }).withMessage('A post with this title already exists.')
    .escape(),
  
  body('subtitle')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a subtitle.').bail()
    .isLength({ min: 2, max: 64 }).withMessage('Post subtitles must be between 2 and 64 characters long.')
    .escape(),

  body('text')
    .trim()
    .isLength({ min: 1 }).withMessage('Cannot submit a blank post.')
    .escape(),
  
  asyncHandler(async (req, res, next) => {
    const errorsArray = validationResult(req).array();
    if (errorsArray.length > 0) return res.json({ errors: errorsArray });
    const post = await findPost(req.params.id);
    if (post.author.toString() !== req.user.userId) return res.send('You are not the author of this post.');
    post.title = req.body.title;
    post.subtitle = req.body.subtitle;
    post.text = req.body.text;
    await post.save();
    res.send('Success - go look at database');
  })
]

postController.deletePost = [
  loginController.authenticateToken,

  body('password')
    .trim()
    .custom(async (value, { req }) => {
      const post = await findPost(req.params.id);
      return post !== null ? true : Promise.reject();
    }).withMessage('Post not found.').bail()
    .custom(async (value, { req }) => {
      const post = await findPost(req.params.id);
      return post.author.toString() === req.user.userId.toString() ? true : Promise.reject();
    }).withMessage('You are not the author of this post.').bail()
    .isLength({ min: 1 }).withMessage('Please input a password.').bail()
    .custom(async (value, { req }) => {
      const author = await Author.findById(req.user.userId);
      const match = await bcrypt.compare(value, author.password);
      return match ? true : Promise.reject();
    }).withMessage('Incorrect password.')
    .escape(),

    asyncHandler(async (req, res, next) => {
      const errorsArray = validationResult(req).array();
      if (errorsArray.length > 0) return res.json({ errors: errorsArray });
      const post = await findPost(req.params.id);
      post.comments.forEach(async commentId => {
        const comment = await Comment.findById(commentId);
        await Comment.deleteOne(comment)
      });
      await Post.deleteOne(post);
      res.send('Success - go look at the database');
    })
]

// postController.getCommentsUnderPost = asyncHandler(async (req, res, next) => {
//   const post = await findPostById(req.params.id, true);
//   if (post === null) {
//     const err = new Error('Post not found.');
//     err.status = 404;
//     return next(err);
//   } else {
//     res.send(post.comments);
//   }
// });

export default postController;