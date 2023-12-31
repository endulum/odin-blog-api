import Author from '../models/author';
import Post from '../models/post';
import Comment from '../models/comment';
import loginController from './loginController';

import asyncHandler from "express-async-handler";
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs/dist/bcrypt';

async function findAuthorById(id, populatePosts = false) {
  let author;
  try { 
    if (populatePosts) author = await Author.findById(id).populate('posts').exec();
    else author = await Author.findById(id).exec();
  }
  catch { author = null }
  return author;
}

const authorController = {}

authorController.getAuthors = asyncHandler(async (req, res, next) => {
  const authors = await Author.find({}).exec();
  res.send(authors);
});

authorController.getAuthorById = asyncHandler(async (req, res, next) => {
  const author = await findAuthorById(req.params.id);
  if (author === null) {
    const err = new Error('Author not found.');
    err.status = 404;
    return next(err);
  } else {
    res.send(author);
  }
});

authorController.getPostsByAuthor = asyncHandler(async (req, res, next) => {
  const author = await findAuthorById(req.params.id, true);
  if (author === null) {
    const err = new Error('Author not found.');
    err.status = 404;
    return next(err);
  } else {
    res.send(author.posts);
  }
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
    const author = await findAuthorById(req.params.id);
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
      const author = await findAuthorById(req.params.id);
      return author !== null ? true : Promise.reject();
    }).withMessage('Author not found.').bail()
    .custom(async (value, {req}) => {
      const author = await findAuthorById(req.params.id);
      return author.username === req.user.username ? true : Promise.reject();
    }).withMessage('You are not this author.').bail()
    .isLength({ min: 1 }).withMessage('Please input a password.').bail()
    .custom(async (value, { req }) => {
      const author = await findAuthorById(req.params.id);
      const match = await bcrypt.compare(value, author.password);
      return match ? true : Promise.reject();
    }).withMessage('Incorrect password.')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errorsArray = validationResult(req).array();
    if (errorsArray.length > 0) return res.json({ errors: errorsArray });
    const author = await findAuthorById(req.params.id);
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