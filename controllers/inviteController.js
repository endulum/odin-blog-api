import Invite from '../models/invite';
import Author from '../models/author';

import asyncHandler from "express-async-handler";
import { body, validationResult } from 'express-validator';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from "jsonwebtoken";
import bcrypt from 'bcryptjs/dist/bcrypt';
import 'dotenv/config';

const inviteController = {};

inviteController.checkCode = [
  // todo: validate/sanitize these
  body('username').trim().escape(),
  body('password').trim().escape(),
  body('penName').trim().escape(),
  body('code').trim().escape(),

  asyncHandler(async (req, res, next) => {
    // const existingAuthor = await Author.findOne({ username: req.body.username });
    // if (existingAuthor !== null) return res.send('An account with this username already exists.');
    const code = await Invite.findOne({ code: req.body.code });
    if (!code) return res.send('This invite code does not exist.');
    else if (code.isClaimed) return res.send('This invite code has already been claimed.');
    else {
      const hashedPassword = await bcryptjs.hash(req.body.password, 10);
      await Author.create({
        username: req.body.username,
        password: hashedPassword,
        penName: req.body.penName
      });

      code.isClaimed = true;
      code.claimedBy = req.body.username;
      await code.save();

      res.send('Success, go look at the database');
    }
  })
];

export default inviteController;