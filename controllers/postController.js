import Post from '../models/post';
import Author from '../models/author';
import Comment from '../models/comment';

import asyncHandler from "express-async-handler";
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs/dist/bcrypt';
// import mongoose from 'mongoose';

const sendErrorsIfAny = asyncHandler(async (req, res, next) => {
  const errorsArray = validationResult(req).array();
  if (errorsArray.length > 0) return res.status(200).json({ errors: errorsArray });
  else return next();
});

const validatePostValues = [
  body('title')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a title.').bail()
    .isLength({ min: 2, max: 64 }).withMessage('Post titles must be between 2 and 64 characters long.')
    .matches(/^[A-Za-z0-9 ]+$/).withMessage('Title contains invalid characters.')
    .custom(async (value, { req }) => {
      const existingPost = await Post.findOne({ title: req.body.title });
      return (existingPost !== null && existingPost._id.toString() !== req.post.id)
        ? Promise.reject() : true;
    }).withMessage('A post already exists with this title. Please select another.')
    .escape(),

  body('subtitle')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a subtitle.').bail()
    .isLength({ min: 2, max: 64 }).withMessage('Post subtitles must be between 2 and 64 characters long.')
    .escape(),

  body('content')
    .trim()
    .isLength({ min: 1 }).withMessage('You cannot submit a blank post.')
    .escape(),

  sendErrorsIfAny
]

const postController = {};

postController.authorizePostAuthor = asyncHandler(async (req, res, next) => {
  const author = await Author.findById(req.user.authorId);
  const post = await Post.find().byIdOrTitle(req.params.id);
  // does this post exist?
  if (post === null)
    return res.status(404).send('Post not found.');
  // does the author of this post exist? (it should - if not, that's a problem?)
  if (author === null)
    return res.status(404).send('Author of post not found.');
  // are you the author of this post?
  if (post.author.toString() !== req.user.authorId)
    return res.status(403).send('This post does not belong to you.');

  req.author = author;
  req.post = post;
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

postController.newPost = [
  validatePostValues,
  asyncHandler(async (req, res, send) => {
    const author = await Author.findById(req.user.authorId);
    if (author === null)
      return res.status(404).send('Author not found.');

    const newPost = new Post({
      author,
      title: req.body.title,
      subtitle: req.body.subtitle,
      content: req.body.content
    });

    author.posts.push(newPost);
    await newPost.save();
    await author.save();
    res.sendStatus(200);
  })
];

postController.editPost = [
  validatePostValues,
  asyncHandler(async (req, res, send) => {
    req.post.title = req.body.title;
    req.post.subtitle = req.body.subtitle;
    req.post.content = req.body.content;
    req.post.lastEdited = Date.now();
    await req.post.save();
    res.sendStatus(200)
  })
];

postController.deletePost = [
  body('password')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a password.').bail()
    .custom(async (value, { req }) => {
      const match = await bcrypt.compare(value, req.author.password);
      return match ? true : Promise.reject();
    }).withMessage('Incorrect password.')
    .escape(),

  sendErrorsIfAny,

  asyncHandler(async (req, res, next) => {
    req.author.posts = req.author.posts.filter(postId => postId.toString() !== req.post._id.toString());
    await req.author.save();
    req.post.comments.forEach(async commentId => {
      const comment = await Comment.findById(commentId);
      await Comment.deleteOne(comment)
    });
    await Post.deleteOne(req.post);
    res.sendStatus(200);
  })
];

postController.newComment = [
  body('commentBy')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter your name.').bail()
    .isLength({ min: 2, max: 32 }).withMessage('Commenter names must be between 2 and 32 characters long.')
    .matches(/^[A-Za-z0-9 .,&-]+$/).withMessage('Commenter name contains invalid characters.')
    .escape(),

  body('commentText')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a comment.').bail()
    .isLength({ min: 2, max: 512 }).withMessage('Comments must be between 2 and 512 characters long.')
    .escape(),

  sendErrorsIfAny,

  asyncHandler(async (req, res, next) => {
    const post = await Post.find().byIdOrTitle(req.params.id).exec();
    if (post === null)
      res.status(404).send('Post not found.');

    const newComment = await Comment.create({
      post: post._id,
      commentBy: req.body.commentBy,
      commentText: req.body.commentText
    });

    post.comments.push(newComment._id);
    await post.save();

    res.sendStatus(200);
  })
];

postController.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.find().byIdOrNull(req.params.commentId);
  if (comment === null)
    return res.status(404).send('Comment not found.');

  req.post.comments = req.post.comments.filter(commentId => commentId.toString() !== req.params.commentId);
  await req.post.save();

  await Comment.deleteOne(comment);
  
  res.sendStatus(200);
});

export default postController;