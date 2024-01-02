## TOP: Blog (API)
RESTful API for a blog setup.

[Blog Frontend](#)[^1]

[Section](https://www.theodinproject.com/lessons/nodejs-blog-api)

### API Structure
`/auth/login`
[x] **POST:** Creates and returns a JWT token signed with an author username, if values provided by the request body are correct for that author account:
  - `username`
  - `password`

`/auth/invite`
[x] **POST:** Requires authorization. Creates a new, unclaimed invite code under the current author.

`/api/authors`
[x] **GET:** Returns an array of author objects.
[x] **POST:** Creates an author account using values provided by the request body:
  - `username`
  - `password`
  - `confirmPassword`
  - `penName`
  - `inviteCode`

`/api/author/:id`
[x] **GET:** Returns the author object, with a partially populated array of posts.
[x] **PUT:** Requires authorization and for the author account to belong to the authorized user. Edits the author object using values provided by the request body:
  - `penName`
  - `bio`
[x] **DELETE:** Requires authorization and for the author account to belong to the authorized user. Deletes the author object, and every post and comment under it, when the correct password is input:
  - `password`

`/api/author/:id/posts`
[x] **GET:** Returns an array of fully populated post objects whose author is this author.

`/api/posts`
[x] **GET:** Returns an array of post objects.
[x] **POST:** Requires authorization. Creates a new post authored by the authorized user using values provided by the request body:
  - `title`
  - `subtitle`
  - `text`

`/api/post/:id`
[x] **GET:** Returns the post object, with a populated array of comment objects.
[x] **PUT:** Requires authorization and for the post to belong to the authorized user. Edits the post using values provided by the request body:
  - `title`
  - `subtitle`
  - `text`
[x] **DELETE:** Requires authorization and for the post to belong to the authorized user. Deletes the post when the correct password is input:
  - `password`

`/api/post/:id/comments`
[x] **GET:** Returns an array of comment objects under this post.
[x] **POST:** Creates a new comment under this post using values provided by the request body:
  - `commenterName`
  - `commentText`

`/api/comment/:id`
[x] **DELETE:** Requires authorization and for the post this comment is under to belong to the authorized user. Deletes the comment when the correct password is input:
  - `password`


[^1]: todo: make the frontend repo and link it here