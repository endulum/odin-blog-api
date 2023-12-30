### TOP: Blog (API)
API-only backend for a blog setup.

[Blog CMS](#)[^1]

[Blog Frontend](#)[^2]

### API Design
- Unprotected (public) GET routes:
  - `api/authors`: gets an array containing all authors.
  - `api/author/{id or pen name}`: gets a particular author by database ID or by username.
  - `api/author/{id or pen name}/posts`: gets an array containing all posts by a particular author.
  - `api/posts`: gets an array containing all posts.
  - `api/post/{id}`: gets a particular post by database ID.
  - `api/post/{id}/comments`: gets an array of all comments under a particular post.
- Unprotected (public) POST routes:
  - `api/post/{id}/comments`: takes in a name, email, and text, and creates a new comment under a particular post with the details provided.
  - `auth/signup`: takes in a username, pen name, password, and invitation code. If all fields are properly filled and the invitation code is unclaimed, this creates a new account in the database using the details provided, and sets an invite code's claimed status to "true".
  - `auth/login`: takes in a username and password. If all fields are properly filled and the username + password combo is valid, this creates a JWT token and stores it in the client's localStorage.
- Protected POST routes:
  - `api/posts`: takes in a post title, subtitle, text, and visibility. If the client is authorized, this creates a new post under their name with the details provided.
- Protected PUT routes:
  - `api/author/{id or pen name}`: takes in a username, pen name, and password. If the client is authorized and the particular author is the current user, this edits the author details with the details provided.
  - `api/post/{id}`: takes in a post title, subtitle, text, and visibility. If the client is authorized and the particular post belongs to the current user, this edits the particular post with the details provided.
- Protected DELETE routes:
  - `api/post/{id}`: if the client is authorized and the particular post belongs to the current user, this deletes the post from the database.
- Inaccessible routes:
  - POST `/api/authors`: creates a new author account. Only the `auth/signup` route should handle this.

[Section](https://www.theodinproject.com/lessons/nodejs-blog-api)

[^1]: todo: make the CMS repo and link it here
[^2]: todo: make the frontend repo and link it here