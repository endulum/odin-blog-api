import Post from '../models/post';

import asyncHandler from "express-async-handler"

async function findPostById(id, populateComments = false) {
  let post;
  try { 
    if (populateComments) post = await Post.findById(id).populate('comments').exec();
    else post = await Post.findById(id).exec()
  }
  catch { post = null }
  return post;
}

const postController = {};

postController.getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({}).exec();
  res.send(posts);
});

postController.getPostById = asyncHandler(async (req, res, next) => {
  const post = await findPostById(req.params.id);
  if (post === null) {
    const err = new Error('Post not found.');
    err.status = 404;
    return next(err);
  } else {
    res.send(post);
  }
});

postController.getCommentsUnderPost = asyncHandler(async (req, res, next) => {
  const post = await findPostById(req.params.id, true);
  if (post === null) {
    const err = new Error('Post not found.');
    err.status = 404;
    return next(err);
  } else {
    res.send(post.comments);
  }
});

export default postController;