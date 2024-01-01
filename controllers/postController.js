import Post from '../models/post';
import Author from '../models/author';
import loginController from './loginController';

import asyncHandler from "express-async-handler";
import { body, validationResult } from 'express-validator';

async function findPost(id) {
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
    .isLength({ min: 2, max: 32 }).withMessage('Post titles must be between 2 and 32 characters long.')
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
    console.log(req.user);
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
  const post = await findPostById(req.params.id);
  if (post === null) {
    const err = new Error('Post not found.');
    err.status = 404;
    return next(err);
  } else {
    res.send(post);
  }
});

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