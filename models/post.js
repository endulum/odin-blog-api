import mongoose from "mongoose";
const Schema = mongoose.Schema;

const  PostSchema = new Schema({
  author: { type: Schema.ObjectId, ref: 'Author' },
  title: { type: String, required: true, minLength: 2, maxLength: 64 },
  subtitle: { type: String, required: true, minLength: 2, maxLength: 128 },
  content: { type: String, required: true, minLength: 2, maxLength: 4096 },
  datePosted: { type: Date, default: () => Date.now(), immutable: true },
  lastEdited: { type: Date },
  comments: [{ type: Schema.ObjectId, ref: 'Comment' }]
});

PostSchema.query.byIdOrTitle = function(idOrTitle) {
  if (mongoose.isValidObjectId(idOrTitle)) 
    return this.findOne({ _id: idOrTitle });
  else  
    return this.findOne({ title: idOrTitle });
};

PostSchema.query.byParams = function(params) {
  // assign default sort direction if the provided one is not valid or there is no provided one
  if (
    !params.sortDirection ||
    !['ascending', 'descending', 'asc', 'desc', -1, 1].includes(params.sortDirection)
  ) { params.sortDirection = 'ascending' }
  // porgramatically build query as an object
  const query = {};
  if (params.title) query.title = { "$regex": params.title, "$options": "i" };
  // programmatically build sort as an object
  const sort = {};
  switch (params.sortBy) {
    case 'datePosted': sort.datePosted = params.sortDirection; break;
    case 'title': sort.title = params.sortDirection; break;
    case 'commentCount': sort.postCount = params.sortDirection; break;
  };
  // combine objects into the resulting query chain
  if (params.populateComments === 'false')
    return this.find(query).sort(sort).limit(params.limit);
  else
    return this.find(query).sort(sort).limit(params.limit).populate('comments');
};

export default mongoose.model('Post', PostSchema);