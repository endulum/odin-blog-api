import loginController from '../controllers/loginController';
import inviteController from '../controllers/inviteController';

import express from "express";

const authRouter = express.Router();

authRouter.route('/login')
  .post(loginController.signToken);

authRouter.route('/invite')
  .post(inviteController.generateCode);

export default authRouter;