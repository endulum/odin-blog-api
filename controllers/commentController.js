import Author from "../models/author";
import Post from "../models/post";
import Comment from "../models/comment";
import loginController from "./loginController";

import asyncHandler from "express-async-handler";
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs/dist/bcrypt';
import mongoose from "mongoose";

const commentController = {};

async function findComment(id) {
  let comment;
  if (mongoose.isValidObjectId(id)) comment = await Comment.findById(id);
  else comment = null;
  return comment;
}

commentController.deleteComment = [
  loginController.authenticateToken,

  body('password')
    .trim()
    .custom(async (value, { req }) => {
      const existingComment = await findComment(req.params.id);
      return existingComment !== null ? true : Promise.reject()
    }).withMessage('Comment not found.')
    .custom(async (value, { req }) => {
      const existingComment = await findComment(req.params.id);
      const postOfComment = await Post.findById(existingComment.post);
      return postOfComment.author.toString() === req.user.userId.toString() ? true : Promise.reject()
    }).withMessage('The post this comment is under does not belong to you.')
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
    const existingComment = await findComment(req.params.id);
    const postOfComment = await Post.findById(existingComment.post);
    postOfComment.comments = await Promise.all(postOfComment.comments.filter(commentId => {
      return commentId.toString() !== existingComment._id.toString()
    }));
    await postOfComment.save();
    await Comment.findByIdAndDelete(req.params.id);
    return res.send('Success - go look at database');
  })
];

export default commentController;