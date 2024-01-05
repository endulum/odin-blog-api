# TOP: Blog (API)
RESTful API for a blog setup.

[Blog Frontend](#)[^1]

[Section](https://www.theodinproject.com/lessons/nodejs-blog-api)

## API Structure

### Logging In
`POST /api/login` returns an authentication token. This token is required for protected routes, acting as proof of which author object the client is logged into. This route requires values to be provided:
- `username`: a string 
  - there must exist an author object whose `username` matches this string
- `password`: a string
  - this must match the `password` of the author object whose `username` is matched by the above

### Authors
`GET /api/author/:id` returns a single author object. The `:id` parameter can be an author's `id` or `userName`.
```json
{
  "id": "65926bdf7b9bf849098c0be2",
  "userName": "someAuthorUsername",
  "displayName": "Some Author Username",
  "bio": "Putting words together to form meaning since '01.",
  "dateJoined": "2024-01-01T07:38:07.947+00:00",
  "postIds": [
    "65926bdf7b9bf849098c0be4",
    "65926bdf7b9bf849098c0be8",
    "65926be07b9bf849098c0bf0"
  ]
}
```
`GET /api/authors` returns an array of author objects. Acceptable query keys are:
- `?displayName=Bob`: filters for any authors whose `displayName` string includes the value `Bob`
- `?userName=Bob`: filters for any authors whose `userName` string includes the value `Bob`
- `?sortBy=dateJoined`: sorts the array by `dateJoined`. Other acceptable sort values are `userName`, `displayName`, and `postCount`.
- `?sortDirection=ascending`: In conjunction with the `sortBy` query, determines whether the array is sorted in `ascending` or `descending` values.
- `?limit=3`: limits the array length to the first 3 results of the query.
- `?populatePosts=true`: instead of the author object containing a `postIds` array of ID references to posts, the object contains a `posts` array of fully populated post objects.

<!-- `POST /api/authors` creates a new author object. This route requires values to be provided:
- `username`: a string
  - between 2 and 32 characters long
  - consisting only of alphabetical letters and numbers[^2]
  - unique, since it must be individually identifiable
- `password`: a string
  - no less than 8 characters long

This route returns an authentication token for the new author account, and requires for there *not* to be a token already present on the client side (that is, you shouldn't sign up if you're already logged in). -->

`PUT /api/author/:id` edits the author object identified by `:id`. This route requires values to be provided:
- `username`: a string
  - between 2 and 32 characters long
  - consisting only of alphabetical letters and numbers[^2]
  - unique, since it must be individually identifiable
- `displayName`: a string
  - between 2 and 32 characters long
  - consisting of only alphabetical letters, numbers, spaces, and certain punctuation[^2]
- `bio`: a string
  - between 2 and 512 characters long
  - consisting of only alphabetical letters, numbers, spaces, and certain punctuation[^2]

`DELETE /api/author/:id` deletes the author object identified by `:id`. This route requires a `password` value to be provided, and it must match the `password` of the author object for deletion to occur.

`PUT /api/author/:id` and `DELETE /api/author/:id` are protected by token authentication.

### Posts
`GET /api/post/:id` returns a single post object. The `:id` parameter can be a post's `id` or `title`.
```json
{
  "id": "65926bdf7b9bf849098c0be8",
  "author": {
    "id": "65926bdf7b9bf849098c0be2",
    "userName": "someAuthorUsername",
    "displayName": "Some Author Username"
  },
  "title": "Some Article Title",
  "subTitle": "This is a one-liner meant to be underneath the title.",
  "content": "Lorem ipsum dolor sit amet...",
  "datePosted": "2024-01-01T07:38:07.947+00:00",
  "lastEdited": "2024-01-01T07:38:07.947+00:00",
  "commentIds": [
    "65926be07b9bf849098c0bf2",
    "65926be07b9bf849098c0bf6",
    "65934b7d71073819898ee98d"
  ]
}
```
`GET /api/posts` returns an array of post objects. Acceptable query keys are:
- `?title=Tech`: filters for any posts whose `title` string includes the value `Tech`.
- `?sortBy=datePosted`: sorts the array by `datePosted`. Other acceptable sort values are `title`, `authorUserName`, `authorDisplayName`, and `commentCount`.
- `?sortDirection=ascending`: In conjunction with the `sortBy` query, determines whether the array is sorted in `ascending` or `descending` values.
- `?limit=3`: limits the array length to the first 3 results of the query.
- `?populateComments=true`: instead of the post object containing a `commentIds` array of ID references to comments, the object contains a `comments` array of fully populated comment objects.

`POST /api/posts` creates a new post object. `PUT /api/post/:id` edits the post object identified by `:id`. Each of these routes require values to be provided:
- `title`: a string
  - between 2 and 32 characters long
  - consisting of only alphabetical letters, numbers, spaces, and certain punctuation[^2]
  - unique, since it must be individually identifiable
- `subtitle`: a string
  - between 2 and 64 characters long
  - consisting of only alphabetical letters, numbers, spaces, and certain punctuation[^2]
- `content`: a string
  - between 2 and 2048 characters long
  - consisting of only alphabetical letters, numbers, spaces, and certain punctuation[^2]

Also, editing a post object will update its `lastEdited` to the current date.

`DELETE /api/post/:id` deletes the post object identified by `:id`. This route requires a `password` value to be provided, and it must match the `password` of the post's author for deletion to occur.

`POST /api/posts`, `PUT /api/post/:id`, and `DELETE /api/post/:id` are protected by token authentication.

### Comments
`GET /api/comment/:id` returns a single comment object. The `:id` parameter must be the comment's `id`.
```json
{
  "id": "65926be07b9bf849098c0bf2",
  "postId": "65926bdf7b9bf849098c0be8",
  "commentBy": "Some Commentator",
  "commentText": "This is a comment. Hopefully it's a nice one.",
  "datePosted": "2024-01-01T07:38:07.947+00:00"
}
```
`DELETE /api/comment/:id` deletes the comment object identified by `:id`. This route requires a `password` value to be provided, and it must match the `password` of the comment's post's author for deletion to occur. This route is protected by token authentication.

## Nice-to-haves
### Invite System
Currently there is no way for clients to "sign up" for their own author accounts. Additionally, ideally the membership of this blog platform is restricted to authors who are permitted - or *invited* - to sign up. An invite system would involve generating invite codes, linked to invite objects with "claimed" statuses, for use when signing up for an author account.
### Private Posting
Currently all post objects can be fetched by the API through `GET` requests regardless of authentication. Adding a `isVisible` property to post objects can allow "unpublished" posts to be filtered out in `GET` requests that are not provided an authentication token.

[^1] todo: make the frontend repo and link it here
[^2] todo: describe with regex patterns