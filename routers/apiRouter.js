import postController from '../controllers/postController';
import authorController from '../controllers/authorController';

import express from "express";
import inviteController from '../controllers/inviteController';

const apiRouter = express.Router();

apiRouter.route('/authors')
  .get(authorController.getAuthors)
  .post(inviteController.redeemCode);
apiRouter.route('/author/:id')
  .get(authorController.getAuthorById)
  .post(authorController.editAuthorById)
  .delete(authorController.deleteAuthorById);
apiRouter.route('/author/:id/posts')
  .get(authorController.getPostsByAuthor);

apiRouter.route('/posts')
  .post(postController.newPost)
  .get(postController.getPosts);
apiRouter.route('/post/:id')
  .get(postController.getPostById)
  .put(postController.editPost)
  .delete(postController.deletePost);
apiRouter.route('/post/:id/comments')
  .get(postController.getCommentsUnderPost)
  .post(postController.newComment);

export default apiRouter;