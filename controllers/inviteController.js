import Invite from '../models/invite';
import Author from '../models/author';
import loginController from './loginController';

import asyncHandler from "express-async-handler";
import { body, validationResult } from 'express-validator';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from "jsonwebtoken";
import bcrypt from 'bcryptjs/dist/bcrypt';
import { faker } from '@faker-js/faker';
import 'dotenv/config';

const inviteController = {};

inviteController.redeemCode = [
  // todo: how can we deal with backslashes, apostrophes, etc in validation?
  // won't they show up weird on the other end?

  body('username')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a username.').bail()
    .isLength({ min: 2, max: 32 }).withMessage('Username must be between 2 and 32 characters long.')
    .isAlphanumeric().withMessage('Username can only consist of letters and numbers.')
    .custom(async (value) => {
      const existingAuthor = await Author.findOne({ username: value });
      return existingAuthor === null ? true : Promise.reject();
    }).withMessage('An account with this username already exists.')
    .escape(),

  body('password')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a password.').bail()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .escape(),

  body('confirmPassword')
    .trim()
    .isLength({ min: 1 }).withMessage('Please confirm your password.').bail()
    .custom((value, { req }) => {
      return value === req.body.password;
    }).withMessage('Passwords do not match.')
    .escape(),

  body('penName').trim().escape()
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter a pen name.').bail()
    .isLength({ min: 2, max: 64 }).withMessage('Pen name must be between 2 and 64 characters long.')
    .matches(/^[A-Za-z0-9 .,&-]+$/).withMessage('Pen name contains invalid characters.')
    .escape(),
  
  body('code')
    .trim()
    .isLength({ min: 1 }).withMessage('Please enter an invite code.').bail()
    .custom(async (value) => {
      const code = await Invite.findOne({ code: value });
      return code !== null ? true : Promise.reject()
    }).withMessage('This invite code does not exist.').bail()
    .custom(async (value) => {
      const code = await Invite.findOne({ code: value });
      return code.claimedBy === null ? true : Promise.reject()
    }).withMessage('This invite code has already been claimed.')
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errorsArray = validationResult(req).array();
    if (errorsArray.length > 0) return res.json({ errors: errorsArray });
    // create the account
    const hashedPassword = await bcryptjs.hash(req.body.password, 10);
    const newAuthor = await Author.create({
      username: req.body.username,
      password: hashedPassword,
      penName: req.body.penName
    });
    console.log(newAuthor);
    // claim the code
    const code = await Invite.findOne({ code: req.body.code });
    code.claimedBy = newAuthor;
    await code.save();
    // todo: change this...
    res.send('Success - go log in!');
  })
];

inviteController.generateCode = [
  loginController.authenticateToken,
  asyncHandler(async (req, res, next) => {
    async function doesCodeExist(code) {
      const existingCode = await Invite.findOne({ code: code });
      return existingCode !== null
    };

    let newCode;
    do {
      newCode = faker.finance.accountNumber({ length: 16 })
    } while (await doesCodeExist(newCode));

    const thisAuthor = await Author.findOne({ username: req.user.username });

    await Invite.create({
      code: newCode,
      generatedBy: thisAuthor,
    });

    res.json({ code: newCode });
  })
]

export default inviteController;