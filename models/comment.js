import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  post: {
    type: Schema.ObjectId,
    ref: 'Post',
    required: true
  },

  username: {
    type: String,
    required: true,
    // todo: min and max lengths?
  },

  text: {
    type: String, 
    // todo: this type will change if comments are written in html or rich text
    required: true,
    // todo: min and max lengths?
  },

  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
});

export default mongoose.model('comment', CommentSchema);