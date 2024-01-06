import mongoose from "mongoose";
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  userName: { type: String, required: true, minLength: 2, maxLength: 32 },
  password: { type: String, required: true, minLength: 8 },
  displayName: { type: String, required: true, minLength: 2, maxLength: 32 },
  bio: { type: String, required: true, minLength: 2, maxLength: 512 },
  dateJoined: { type: Date, default: () => Date.now(), immutable: true },
  posts: [{ type: Schema.ObjectId, ref: 'Post' }],
});

AuthorSchema.virtual('postCount').get(function() { return this.posts.length });

AuthorSchema.query.byIdOrUser = function(idOrUser) { // for use with GET /api/author/:id
  if (mongoose.isValidObjectId(idOrUser)) 
    return this.findOne({ _id: idOrUser });
  else  
    return this.findOne({ userName: idOrUser });
};

AuthorSchema.query.byParams = function(params) { // for use with GET /api/authors?key=value&...
  // assign default sort direction if the provided one is not valid or there is no provided one
  if (
    !params.sortDirection ||
    !['ascending', 'descending', 'asc', 'desc', -1, 1].includes(params.sortDirection)
  ) { params.sortDirection = 'asc' }
  // porgramatically build query as an object
  const query = {};
  if (params.displayName) query.displayName = { "$regex": params.displayName, "$options": "i" };
  if (params.userName) query.userName = { "$regex": params.userName, "$options": "i" };
  // programmatically build sort as an object
  const sort = {};
  switch (params.sortBy) {
    case 'dateJoined': sort.dateJoined = params.sortDirection; break;
    case 'userName': sort.userName = params.sortDirection; break;
    case 'displayName': sort.displayName = params.sortDirection; break;
  };
  // combine objects into the resulting query chain
  if (params.populatePosts === "false")
    return this.find(query).sort(sort).limit(params.limit);
  else
    return this.find(query).sort(sort).limit(params.limit).populate('posts');
};

export default mongoose.model('Author', AuthorSchema);