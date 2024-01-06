import authController from "../controllers/authController";
import authorController from "../controllers/authorController";

import express from "express";
import postController from "../controllers/postController";

const apiRouter = express.Router();

apiRouter.route('/login')
  .post(authController.signToken);

apiRouter.route('/authors')
  .get(authorController.getAuthorsArray);

apiRouter.route('/author/:id')
  .get(authorController.getAuthor)
  .put() // edits an author by id, protected
  .delete(); // deletes an author by id, protected

apiRouter.route('/posts')
  .get(postController.getPostsArray);

apiRouter.route('/post/:id')
  .get(postController.getPost)
  .put() // edits a post by id, protected
  .delete(); // deletes a post by id, protected

apiRouter.route('/comment/:id')
  .get() // returns a comment by id
  .delete(); // deletes a comment by id, protected

export default apiRouter;