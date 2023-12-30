import mongoose from "mongoose";
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  username: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 32
    // can only contain letters and numbers
  },

  password: {
    type: String,
    required: true,
    minLength: 8
  },

  penName: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 64
    // can contain letters, numbers, spaces, periods, apostrophes
  },

  posts: [{
    type: Schema.ObjectId,
    ref: 'Post',
  }],
});

export default mongoose.model('Author', AuthorSchema);