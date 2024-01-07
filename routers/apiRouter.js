import authController from "../controllers/authController";
import authorController from "../controllers/authorController";
import postController from "../controllers/postController";

import express from "express";

const apiRouter = express.Router();

apiRouter.route('/login')
  .get(
    authController.authenticateToken, 
    authController.checkToken
  )
  .post(authController.signToken);

apiRouter.route('/authors')
  .get(authorController.getAuthorsArray);

apiRouter.route('/author/:id')
  .get(authorController.getAuthor)
  .put(
    authController.authenticateToken, 
    authorController.authorizeAuthor,
    authorController.editAuthor
  )
  .delete(
    authController.authenticateToken, 
    authorController.authorizeAuthor,
    authorController.deleteAuthor
  );

apiRouter.route('/posts')
  .get(postController.getPostsArray)
  .post(
    authController.authenticateToken,
    postController.newPost
  );

apiRouter.route('/post/:id')
  .get(postController.getPost)
  .put(
    authController.authenticateToken,
    postController.authorizePostAuthor,
    postController.editPost
  )
  .delete(
    authController.authenticateToken,
    postController.authorizePostAuthor,
    postController.deletePost
  );

apiRouter.route('/post/:id/comment')
  .post(postController.newComment);

apiRouter.route('/post/:id/comment/:commentId')
  .delete(
    authController.authenticateToken,
    postController.authorizePostAuthor,
    postController.deleteComment
  );

export default apiRouter;