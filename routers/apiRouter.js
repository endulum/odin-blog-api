import express from "express";

const apiRouter = express.Router();

apiRouter.route('/login')
  .post(); // returns an auth token for use with protected routes

apiRouter.route('/authors')
  .get(); // returns array of authors

apiRouter.route('/author/:id')
  .get() // returns an author by id
  .put() // edits an author by id, protected
  .delete(); // deletes an author by id, protected

apiRouter.route('/posts')
  .get(); // returns an array of posts

apiRouter.route('/post/:id')
  .get() // returns a post by id
  .put() // edits a post by id, protected
  .delete(); // deletes a post by id, protected

apiRouter.route('/comment/:id')
  .get() // returns a comment by id
  .delete(); // deletes a comment by id, protected

export default apiRouter;