import loginController from '../controllers/loginController';
import inviteController from '../controllers/inviteController';

import express from "express";

const authRouter = express.Router();

authRouter.route('/signup')
  .post(inviteController.checkCode);

authRouter.route('/login')
  .post(loginController.signToken);

export default authRouter;