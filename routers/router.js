import Author from '../models/author';
import Post from '../models/post';
import Comment from '../models/comment';
import postController from '../controllers/postController';
import authorController from '../controllers/authorController';

import express from "express";

const router = express.Router();

router.route('/authors')
  .get(authorController.getAuthors);
router.route('/author/:id')
  .get(authorController.getAuthorById);
router.route('/author/:id/posts')
  .get(authorController.getPostByAuthor);

router.route('/posts')
  .get(postController.getPosts);
router.route('/post/:id')
  .get(postController.getPostById);
router.route('/post/:id/comments')
  .get(postController.getCommentsUnderPost);

export default router;