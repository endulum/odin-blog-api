import Author from '../models/author';

import asyncHandler from "express-async-handler";
import jsonwebtoken from "jsonwebtoken";
import bcrypt from 'bcryptjs/dist/bcrypt';
import 'dotenv/config';

const loginController = {};

loginController.signToken = asyncHandler(async (req, res, next) => {
  const author = await Author.findOne({ username: req.query.username });
  if (!author) return res.send('User not found.');

  if (!req.query.password) return res.send('No password was given.');

  const match = await bcrypt.compare(req.query.password, author.password);
  if (!match) return res.send('Wrong password was given.');

  const accessToken = jsonwebtoken.sign(
    { username: author.username },
    process.env.ACCESS_TOKEN_SECRET,
  );

  res.json({ accessToken });
});

loginController.authenticateToken = function (req, res, next) {
  const bearerHeader = req.headers['authorization'];
  const bearerToken = bearerHeader && bearerHeader.split(' ')[1];
  if (!bearerToken) return res.sendStatus(401);

  jsonwebtoken.verify(
    bearerToken,
    process.env.ACCESS_TOKEN_SECRET,
    (err, user) => {
      if (err) return res.sendStatus(403);
      req.username = username;
      next();
    }
  )
}

export default loginController;