import Author from '../models/author';

import asyncHandler from "express-async-handler"

async function findAuthorById(id, populatePosts = false) {
  let author;
  try { 
    if (populatePosts) author = await Author.findById(id).populate('posts').exec();
    else author = await Author.findById(id).exec();
  }
  catch { author = null }
  return author;
}

const authorController = {}

authorController.getAuthors = asyncHandler(async (req, res, next) => {
  const authors = await Author.find({}).exec();
  res.send(authors);
});

authorController.getAuthorById = asyncHandler(async (req, res, next) => {
  const author = await findAuthorById(req.params.id);
  if (author === null) {
    const err = new Error('Author not found.');
    err.status = 404;
    return next(err);
  } else {
    res.send(author);
  }
});

authorController.getPostsByAuthor = asyncHandler(async (req, res, next) => {
  const author = await findAuthorById(req.params.id, true);
  if (author === null) {
    const err = new Error('Author not found.');
    err.status = 404;
    return next(err);
  } else {
    res.send(author.posts);
  }
});

export default authorController;