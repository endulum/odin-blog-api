import Post from '../models/post';
import Author from '../models/author';
import Comment from '../models/comment';

import asyncHandler from "express-async-handler";
// import { body, validationResult } from 'express-validator';
// import bcrypt from 'bcryptjs/dist/bcrypt';
// import mongoose from 'mongoose';

const postController = {};

postController.authorizePostAuthor = asyncHandler(async (req, res, next) => {
  const post = await Post.find().byIdOrTitle(req.params.id);
  // does this post exist?
  if (post === null)
    return res.status(404).send('Post not found.');
  // are you the author of this post?
  if (post.author.toString() !== req.user.authorId)
    return res.status(403).send('This post does not belong to you.');

  return next();
})

postController.getPostsArray = asyncHandler(async (req, res, next) => {
  const posts = await Post.find().byParams(req.query).populate('author').exec();
  return res.status(202).json(posts.map(post => {
    const postJSON = {
      id: post._id,
      author: {
        id: post.author._id,
        userName: post.author.userName,
        displayName: post.author.displayName
      },
      title: post.title,
      subtitle: post.subtitle,
      content: post.content,
      datePosted: post.datePosted,
      lastEdited: post.lastEdited || null
    };

    if (req.query.populateComments === "false")
      postJSON.commentIDs = post.comments;
    else
      postJSON.comments = post.comments.map(comment => {
        return {
          id: comment._id,
          commentBy: comment.commentBy,
          commentText: comment.commentText,
          datePosted: comment.datePosted
        }
      });
    return postJSON;
  }));
});

postController.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.find().byIdOrTitle(req.params.id).populate('author').populate('comments').exec();
  if (post === null) return res.status(404).send('Post not found.');
  // todo: find proper way to send error in json?
  return res.status(202).json({
    id: post._id,
    author: {
      id: post.author._id,
      userName: post.author.userName,
      displayName: post.author.displayName
    },
    title: post.title,
    subtitle: post.subtitle,
    content: post.content,
    datePosted: post.datePosted,
    lastEdited: post.lastEdited || null,
    comments: post.comments.map(comment => {
      return {
        id: comment._id,
        commentBy: comment.commentBy,
        commentText: comment.commentText,
        datePosted: comment.datePosted
      }
    })
  });
});

// postController.newPost = [
//   loginController.authenticateToken,

//   body('title')
//     .trim()
//     .isLength({ min: 1 }).withMessage('Please enter a title.').bail()
//     .isLength({ min: 2, max: 64 }).withMessage('Post titles must be between 2 and 64 characters long.')
//     .matches(/^[A-Za-z0-9 ]+$/).withMessage('Title contains invalid characters.')
//     .custom(async (value, { req }) => {
//       const existingPost = await Post.findOne({ title: req.body.title });
//       return existingPost === null ? true : Promise.reject()
//     }).withMessage('A post with this title already exists.')
//     .escape(),

//   body('subtitle')
//     .trim()
//     .isLength({ min: 1 }).withMessage('Please enter a subtitle.').bail()
//     .isLength({ min: 2, max: 64 }).withMessage('Post subtitles must be between 2 and 64 characters long.')
//     .escape(),

//   body('text')
//     .trim()
//     .isLength({ min: 1 }).withMessage('Cannot submit a blank post.')
//     .escape(),

//   asyncHandler(async (req, res, next) => {
//     const errorsArray = validationResult(req).array();
//     if (errorsArray.length > 0) return res.json({ errors: errorsArray });
//     // console.log(req.user);
//     await Post.create({
//       author: req.user.userId,
//       title: req.body.title,
//       subtitle: req.body.subtitle,
//       text: req.body.text
//     });
//     res.send('Success - go look in database');
//   }),
// ]

// postController.editPost = [
//   loginController.authenticateToken,

//   body('title')
//     .trim()
//     .isLength({ min: 1 }).withMessage('Please enter a title.').bail()
//     .isLength({ min: 2, max: 64 }).withMessage('Post titles must be between 2 and 64 characters long.')
//     .matches(/^[A-Za-z0-9 ]+$/).withMessage('Title contains invalid characters.')
//     .custom(async (value, { req }) => {
//       const existingPost = await findPost(req.params.id);
//       return existingPost !== null ? true : Promise.reject();
//     }).withMessage('Post not found.')
//     .custom(async (value, { req }) => {
//       const existingPost = await Post.findOne({ title: req.body.title });
//       if (existingPost && existingPost.title === req.body.title) {
//         const thisPost = await findPost(req.params.id);
//         if (existingPost._id.toString() === thisPost._id.toString()) return true;
//         return Promise.reject();
//       } else return true;
//     }).withMessage('A post with this title already exists.')
//     .escape(),

//   body('subtitle')
//     .trim()
//     .isLength({ min: 1 }).withMessage('Please enter a subtitle.').bail()
//     .isLength({ min: 2, max: 64 }).withMessage('Post subtitles must be between 2 and 64 characters long.')
//     .escape(),

//   body('text')
//     .trim()
//     .isLength({ min: 1 }).withMessage('Cannot submit a blank post.')
//     .escape(),

//   asyncHandler(async (req, res, next) => {
//     const errorsArray = validationResult(req).array();
//     if (errorsArray.length > 0) return res.json({ errors: errorsArray });
//     const post = await findPost(req.params.id);
//     if (post.author.toString() !== req.user.userId) return res.send('You are not the author of this post.');
//     post.title = req.body.title;
//     post.subtitle = req.body.subtitle;
//     post.text = req.body.text;
//     await post.save();
//     res.send('Success - go look at database');
//   })
// ]

// postController.deletePost = [
//   loginController.authenticateToken,

//   body('password')
//     .trim()
//     .custom(async (value, { req }) => {
//       const post = await findPost(req.params.id);
//       return post !== null ? true : Promise.reject();
//     }).withMessage('Post not found.').bail()
//     .custom(async (value, { req }) => {
//       const post = await findPost(req.params.id);
//       return post.author.toString() === req.user.userId.toString() ? true : Promise.reject();
//     }).withMessage('You are not the author of this post.').bail()
//     .isLength({ min: 1 }).withMessage('Please input a password.').bail()
//     .custom(async (value, { req }) => {
//       const author = await Author.findById(req.user.userId);
//       const match = await bcrypt.compare(value, author.password);
//       return match ? true : Promise.reject();
//     }).withMessage('Incorrect password.')
//     .escape(),

//   asyncHandler(async (req, res, next) => {
//     const errorsArray = validationResult(req).array();
//     if (errorsArray.length > 0) return res.json({ errors: errorsArray });
//     const post = await findPost(req.params.id);
//     post.comments.forEach(async commentId => {
//       const comment = await Comment.findById(commentId);
//       await Comment.deleteOne(comment)
//     });
//     await Post.deleteOne(post);
//     res.send('Success - go look at the database');
//   })
// ]

// postController.newComment = [
//   body('commenterName')
//     .trim()
//     .isLength({ min: 1 }).withMessage('Please enter your name.').bail()
//     .isLength({ min: 2, max: 32 }).withMessage('Commenter names must be between 2 and 32 characters long.')
//     .matches(/^[A-Za-z0-9 .,&-]+$/).withMessage('Commenter name contains invalid characters.')
//     .escape(),

//   body('text')
//     .trim()
//     .isLength({ min: 1 }).withMessage('Please enter a comment.').bail()
//     .isLength({ min: 2, max: 512 }).withMessage('Comments must be between 2 and 512 characters long.')
//     .escape(),

//   asyncHandler(async (req, res, next) => {
//     const errorsArray = validationResult(req).array();
//     const post = await findPost(req.params.id);
//     if (post === null) errorsArray.push({ msg: 'Post not found.' });
//     if (errorsArray.length > 0) return res.json({ errors: errorsArray });
//     const newComment = await Comment.create({
//       post: post._id,
//       commenterName: req.body.commenterName,
//       text: req.body.text
//     });

//     post.comments.push(newComment._id);
//     await post.save();

//     res.send('Success - go look at database');
//   })
// ];

export default postController;