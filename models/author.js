import mongoose from "mongoose";
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  username: {
    type: String,
    required: true,
    // todo: min and max lengths?
  },

  password: {
    type: String,
    required: true,
    // todo: min and max lengths?
  },

  penName: {
    type: String,
    required: true,
  },

  posts: [{
    type: Schema.ObjectId,
    ref: 'Post',
  }],
});

export default mongoose.model('Author', AuthorSchema);