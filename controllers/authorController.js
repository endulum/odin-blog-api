import Author from '../models/author';
import Post from '../models/post';
import Comment from '../models/comment';

import mongoose from 'mongoose';
import asyncHandler from "express-async-handler";
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs/dist/bcrypt';

const sendErrorsIfAny = asyncHandler(async (req, res, next) => {
  const errorsArray = validationResult(req).array();
  if (errorsArray.length > 0) return res.status(200).json({ errors: errorsArray });
  else return next();
});

const authorController = {}

authorController.authorizeAuthor = asyncHandler(async (req, res, next) => {
  const author = await Author.find().byIdOrUser(req.params.id);
  // does this author exist?
  if (author === null) 
    return res.status(404).send('Author not found.');
  // are you this author?
  if (author._id.toString() !== req.user.authorId) 
      return res.status(403).send('You are not this author.');
  
  req.author = author;
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

authorController.editAuthor = [
  body('userName')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a username.').bail()
    .isLength({ min: 2, max: 64 }).withMessage('Username must be between 2 and 32 characters long.')
    .matches(/^[A-Za-z0-9_.-]+$/).withMessage('Username contains invalid characters.')
    .custom(async (value, { req }) => {
      const existingAuthor = await Author.findOne({ userName: req.body.userName }).exec();
      return (existingAuthor !== null && existingAuthor._id.toString() !== req.user.authorId) 
        ? Promise.reject() : true;
    }).withMessage('An author already exists with this username. Please select another.')
    .escape(),
  
  body('displayName')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a display name.').bail()
    .isLength({ min: 2, max: 64 }).withMessage('Display name must be between 2 and 32 characters long.')
    .matches(/^[A-Za-z0-9 .,&-']+$/).withMessage('Display name contains invalid characters.')
    .escape(),

  body('bio')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a bio.').bail()
    .isLength({ min: 2, max: 64 }).withMessage('Bio must be between 2 and 512 characters long.')
    .escape(),

  sendErrorsIfAny,

  asyncHandler(async (req, res, next) => {
    req.author.userName = req.body.userName;
    req.author.displayName = req.body.displayName;
    req.author.bio = req.body.bio;
    await req.author.save();
    res.sendStatus(200);
  })
];

authorController.deleteAuthor = [
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
    req.author.posts.forEach(async postId => {
      const post = await Post.findById(postId);
      post.comments.forEach(async commentId => {
        const comment = await Comment.findById(commentId);
        await Comment.deleteOne(comment)
      });
      await Post.deleteOne(post);
    });

    await Author.deleteOne(req.author);
    res.sendStatus(200);
  })
];

export default authorController;