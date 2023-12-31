import Author from '../models/author';
import Post from '../models/post';
import Comment from '../models/comment';
import loginController from './loginController';

import mongoose from 'mongoose';
import asyncHandler from "express-async-handler";
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs/dist/bcrypt';

async function findAuthor(id) {
  let author;
  if (mongoose.isValidObjectId(id)) author = await Author.findById(id).exec();
  else author = await Author.findOne({ username: id }).exec();
  return author;
}

const authorController = {}

authorController.getAuthors = asyncHandler(async (req, res, next) => {
  const authors = await Author.find({}).exec();
  res.json(authors.map(author => {
    return {
      username: author.username,
      penName: author.penName,
      bio: author.bio,
      postIds: author.posts
    }
  }));
});

authorController.getAuthorById = asyncHandler(async (req, res, next) => {
  const author = await findAuthor(req.params.id);
  if (author) return res.json({
    username: author.username,
    penName: author.penName,
    bio: author.bio,
    posts: author.posts
  });
  else {
    const err = new Error('Author not found.');
    err.status = 404;
    return next(err); 
  } // todo: change error html to json
});

authorController.getPostsByAuthor = asyncHandler(async (req, res, next) => {
  const author = await findAuthor(req.params.id, true);
  if (author) {
    const posts = await Promise.all(author.posts.map(async postId => {
      const post = await Post.findById(postId).populate('comments').exec();
      return {
        author: author.username,
        title: post.title,
        subtitle: post.subtitle,
        text: post.text,
        timestamp: post.timestamp,
        comments: post.comments.map(comment => {
          return {
            commenter: comment.commenterName,
            text: comment.text,
            timestamp: comment.timestamp
          }
        })
      }
    }));
    res.json({ posts });
  } else {
    const err = new Error('Author not found.');
    err.status = 404;
    return next(err); 
  } // todo: change error html to json
});

authorController.editAuthorById = [
  loginController.authenticateToken,

  body('penName')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a pen name.').bail()
    .isLength({ min: 2, max: 64 }).withMessage('Pen name must be between 2 and 64 characters long.')
    .matches(/^[A-Za-z0-9 .,&-]+$/).withMessage('Pen name contains invalid characters.')
    .escape(),

  body('bio')
    .trim()
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errorsArray = validationResult(req).array();
    if (errorsArray.length > 0) return res.json({ errors: errorsArray });
    const author = await findAuthor(req.params.id);
    if (author === null) {
      const err = new Error('Author not found.');
      err.status = 404;
      return next(err);
    } else if (author.username !== req.user.username) {
      return res.send('You\'re not this user.')
    } else {
      author.penName = req.body.penName;
      author.bio = req.body.bio;
      await author.save();
      res.send('Success - go look at the database')
    }
  })
];

authorController.deleteAuthorById = [
  // todo: i keep redefining "author" in many places.
  // is there a way to define it once at the start of this chain,
  // and reuse it in the rest of the chain?
  loginController.authenticateToken,

  body('password')
    .trim()
    .custom(async (value, { req }) => {
      const author = await findAuthor(req.params.id);
      return author !== null ? true : Promise.reject();
    }).withMessage('Author not found.').bail()
    .custom(async (value, { req }) => {
      const author = await findAuthor(req.params.id);
      return author.username === req.user.username ? true : Promise.reject();
    }).withMessage('You are not this author.').bail()
    .isLength({ min: 1 }).withMessage('Please input a password.').bail()
    .custom(async (value, { req }) => {
      const author = await findAuthor(req.params.id);
      const match = await bcrypt.compare(value, author.password);
      return match ? true : Promise.reject();
    }).withMessage('Incorrect password.')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errorsArray = validationResult(req).array();
    if (errorsArray.length > 0) return res.json({ errors: errorsArray });
    const author = await findAuthor(req.params.id);
    author.posts.forEach(async postId => {
      const post = await Post.findById(postId);
      // console.log(post);
      post.comments.forEach(async commentId => {
        const comment = await Comment.findById(commentId);
        // console.log(comment);
        await Comment.deleteOne(comment)
      })
      await Post.deleteOne(post);
    });
    await Author.deleteOne(author);
    res.send('Success - go look at the database');
  })
]

export default authorController;