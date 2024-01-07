import Author from '../models/author';

import asyncHandler from "express-async-handler";
import { body, validationResult } from 'express-validator';
import jsonwebtoken from "jsonwebtoken";
import bcrypt from 'bcryptjs/dist/bcrypt';
import 'dotenv/config';

const sendErrorsIfAny = asyncHandler(async (req, res, next) => {
  const errorsArray = validationResult(req).array();
  if (errorsArray.length > 0) return res.status(200).json({ errors: errorsArray });
  else return next();
});

const authController = {};

authController.authenticateToken = function (req, res, next) {
  const bearerHeader = req.headers['authorization'];
  const bearerToken = bearerHeader && bearerHeader.split(' ')[1];
  if (!bearerToken) return res.sendStatus(401);

  jsonwebtoken.verify(
    bearerToken,
    process.env.ACCESS_TOKEN_SECRET,
    (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      return next();
    }
  )
};

authController.checkToken = asyncHandler(async (req, res, next) => {
  res.json(req.user);
});

authController.signToken = [
  body('userName')
    .trim()
    .isLength({ min: 1 }).withMessage('Please input a username.').bail()
    .custom(async (value, { req }) => {
      const author = await Author.findOne({ userName: value });
      if (author !== null) {
        req.author = author;
        return true;
      } return Promise.reject();
    }).withMessage('No account exists with this username.')
    .escape(),

  sendErrorsIfAny,

  body('password')
    .trim()
    .isLength({ min: 1 }).withMessage('Please input a password.').bail()
    .custom(async (value, { req }) => {
      const match = await bcrypt.compare(value, req.author.password);
      return match ? true : Promise.reject();
    }).withMessage('Incorrect password.')
    .escape(),

  sendErrorsIfAny,

  asyncHandler(async (req, res, next) => {
    const accessToken = jsonwebtoken.sign(
      { authorId: req.author._id },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.json({ accessToken });
  })
];

export default authController;