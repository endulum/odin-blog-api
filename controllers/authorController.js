import Author from '../models/author';
import Post from '../models/post';

import mongoose from 'mongoose';
import asyncHandler from "express-async-handler";
// import { body, validationResult } from 'express-validator';
// import bcrypt from 'bcryptjs/dist/bcrypt';

const authorController = {}

authorController.authorizeAuthor = asyncHandler(async (req, res, next) => {
  const author = await Author.find().byIdOrUser(req.params.id);
  // does this author exist?
  if (author === null) 
    return res.status(404).send('Author not found.');
  // are you this author?
  if (author._id.toString() !== req.user.authorId) 
      return res.status(403).send('You are not this author.');
  
  return next();
})

authorController.getAuthorsArray = asyncHandler(async (req, res, next) => {
  const authors = await Author.find().byParams(req.query).exec();
  res.json(authors.map(author => {
    const authorJSON = {
      id: author._id,
      userName: author.userName,
      displayName: author.displayName,
      bio: author.bio,
      dateJoined: author.dateJoined
    };

    if (req.query.populatePosts && req.query.populatePosts === "false")
      authorJSON.postIDs = author.posts;
    else
      authorJSON.posts = author.posts.map(post => {
        return {
          id: post._id,
          title: post.title,
          subtitle: post.subtitle,
          datePosted: post.datePosted
        }
      });

    return authorJSON;
  }))
})

authorController.getAuthor = asyncHandler(async (req, res, next) => {
  const author = await Author.find().byIdOrUser(req.params.id).populate('posts').exec();
  if (author === null) return res.status(404).send('Author not found.'); 
  // todo: find proper way to send error in json?
  return res.json({
    id: author._id,
    userName: author.userName,
    displayName: author.displayName,
    bio: author.bio,
    dateJoined: author.dateJoined,
    posts: author.posts.map(post => {
      return {
        id: post._id,
        title: post.title,
        subtitle: post.subtitle,
        datePosted: post.datePosted
      }
    })
  })
})

// authorController.editAuthorById = [
//   loginController.authenticateToken,

//   body('penName')
//     .trim()
//     .isLength({ min: 1 }).withMessage('Please enter a pen name.').bail()
//     .isLength({ min: 2, max: 64 }).withMessage('Pen name must be between 2 and 64 characters long.')
//     .matches(/^[A-Za-z0-9 .,&-]+$/).withMessage('Pen name contains invalid characters.')
//     .escape(),

//   body('bio')
//     .trim()
//     .escape(),

//   asyncHandler(async (req, res, next) => {
//     const errorsArray = validationResult(req).array();
//     if (errorsArray.length > 0) return res.json({ errors: errorsArray });
//     const author = await findAuthor(req.params.id);
//     if (author === null) {
//       const err = new Error('Author not found.');
//       err.status = 404;
//       return next(err);
//     } else if (author.username !== req.user.username) {
//       return res.send('You are not this author.')
//     } else {
//       author.penName = req.body.penName;
//       author.bio = req.body.bio;
//       await author.save();
//       // todo: change this
//       res.send('Success - go look at the database')
//     }
//   })
// ];

// authorController.deleteAuthorById = [
//   // todo: i keep redefining "author" in many places.
//   // is there a way to define it once at the start of this chain,
//   // and reuse it in the rest of the chain?
//   loginController.authenticateToken,

//   body('password')
//     .trim()
//     .custom(async (value, { req }) => {
//       const author = await findAuthor(req.params.id);
//       return author !== null ? true : Promise.reject();
//     }).withMessage('Author not found.').bail()
//     .custom(async (value, { req }) => {
//       const author = await findAuthor(req.params.id);
//       return author.username === req.user.username ? true : Promise.reject();
//     }).withMessage('You are not this author.').bail()
//     .isLength({ min: 1 }).withMessage('Please input a password.').bail()
//     .custom(async (value, { req }) => {
//       const author = await findAuthor(req.params.id);
//       const match = await bcrypt.compare(value, author.password);
//       return match ? true : Promise.reject();
//     }).withMessage('Incorrect password.')
//     .escape(),

//   asyncHandler(async (req, res, next) => {
//     const errorsArray = validationResult(req).array();
//     if (errorsArray.length > 0) return res.json({ errors: errorsArray });
//     const author = await findAuthor(req.params.id);
//     author.posts.forEach(async postId => {
//       const post = await Post.findById(postId);
//       post.comments.forEach(async commentId => {
//         const comment = await Comment.findById(commentId);
//         await Comment.deleteOne(comment)
//       })
//       await Post.deleteOne(post);
//     });
//     await Author.deleteOne(author);
//     // todo: change this
//     res.send('Success - go look at the database');
//   })
// ]

export default authorController;