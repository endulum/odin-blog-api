import loginController from '../controllers/loginController';

import express from "express";

const authRouter = express.Router();

authRouter.route('/login')
  .post(loginController.signToken);

export default authRouter;