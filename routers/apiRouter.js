import postController from '../controllers/postController';
import authorController from '../controllers/authorController';

import express from "express";

const apiRouter = express.Router();

apiRouter.route('/authors')
  .get(authorController.getAuthors);
apiRouter.route('/author/:id')
  .get(authorController.getAuthorById)
  .post(authorController.editAuthorById)
  .delete(authorController.deleteAuthorById);
apiRouter.route('/author/:id/posts')
  .get(authorController.getPostsByAuthor);

apiRouter.route('/posts')
  .get(postController.getPosts);
apiRouter.route('/post/:id')
  .get(postController.getPostById);
apiRouter.route('/post/:id/comments')
  .get(postController.getCommentsUnderPost);

export default apiRouter;