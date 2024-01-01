import Author from '../models/author';

import asyncHandler from "express-async-handler";
import { body, validationResult } from 'express-validator';
import jsonwebtoken from "jsonwebtoken";
import bcrypt from 'bcryptjs/dist/bcrypt';
import 'dotenv/config';

const loginController = {};

loginController.signToken = [
  body('username').trim().escape(),
  
  // doubled up on validation for both password and username here because 
  // i want each of these errors to appear one at a time and in the same chaim
  // it looks a little messy though. todo: untangle this later?
  body('password')
    .trim()
    .custom((value, { req }) => {
      return req.body.username && req.body.username.length > 0
    }).withMessage('Please input a username.')
    .isLength({ min: 1 }).withMessage('Please input a password.').bail()
    .custom(async (value, { req }) => {
      const existingAuthor = await Author.findOne({ username: req.body.username });
      return existingAuthor !== null ? true : Promise.reject();
    }).withMessage('No account with this username exists.').bail()
    .custom(async (value, { req }) => {
      const author = await Author.findOne({ username: req.body.username });
      const match = await bcrypt.compare(value, author.password);
      return match ? true : Promise.reject();
    }).withMessage('Incorrect password.')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errorsArray = validationResult(req).array();
    if (errorsArray.length > 0) return res.json({ errors: errorsArray });
    // sign and send the token
    const existingAuthor = await Author.findOne({ username: req.body.username });
    const accessToken = jsonwebtoken.sign(
      { 
        username: req.body.username, 
        userId: existingAuthor._id
      }, // wait, is it a bad idea to grab the username straight from the body?
      process.env.ACCESS_TOKEN_SECRET
    );
    res.json({ accessToken });
  })
];

loginController.authenticateToken = function (req, res, next) {
  const bearerHeader = req.headers['authorization'];
  const bearerToken = bearerHeader && bearerHeader.split(' ')[1];
  if (!bearerToken) return res.sendStatus(401);

  jsonwebtoken.verify(
    bearerToken,
    process.env.ACCESS_TOKEN_SECRET,
    (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    }
  )
}

export default loginController;