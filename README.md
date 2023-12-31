## TOP: Blog (API)
RESTful API for a blog setup.

[Blog Frontend](#)[^1]

[Section](https://www.theodinproject.com/lessons/nodejs-blog-api)

### API Structure
`/auth/login`
- **POST:** Creates and returns a JWT token signed with an author username, if values provided by the request body are correct for that author account.

`/api/authors`
- **GET:** Returns an array of author objects.
- **POST:** Creates an author account using values provided by the request body:
  - `username`
  - `password`
  - `confirmPassword`
  - `penName`
  - `inviteCode`

`/api/author/:id`
- **GET:** Returns the author object, with a partially populated array of posts.
- **PUT:** Requires authorization and for the author account to belong to the authorized user. Edits the author object using values provided by the request body:
  - `penName`
  - `bio`
- **DELETE:** Requires authorization and for the author account to belong to the authorized user. Deletes the author object when the correct password is input:
  - `password`

`/api/author/:id/posts`
- **GET:** Returns an array of post objects whose author is this author.

`/api/posts`
- **GET:** Returns an array of post objects.
- **POST:** Requires authorization. Creates a new post authored by the authorized user using values provided by the request body:
  - `title`
  - `subtitle`
  - `text`

`/api/post/:id`
- **GET:** Returns the post object, with a populated array of comment objects.
- **PUT:** Requires authorization and for the post to belong to the authorized user. Edits the post using values provided by the request body:
  - `title`
  - `subtitle`
  - `text`
- **DELETE:** Requires authorization and for the post to belong to the authorized user. Deletes the post when the correct password is input:
  - `password`

`/api/post/:id/comments`
- **GET:** Returns an array of comment objects under this post.
- **POST:** Creates a new comment under this post using values provided by the request body:
  - `commenterName`
  - `commentText`

`/api/comment/:id`
- **DELETE:** Requires authorization and for the post this comment is under to belong to the authorized user. Deletes the comment when the correct password is input:
  - `password`


[^1]: todo: make the frontend repo and link it here