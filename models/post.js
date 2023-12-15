import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: {
    type: Schema.ObjectId,
    ref: 'Author',
    required: true
  },

  title: {
    type: String,
    required: true,
    // todo: min and max lengths?
  },

  subtitle: {
    type: String,
    required: true,
    // todo: min and max lengths?
  },

  text: {
    type: String, 
    // todo: this type will change if blog posts are written in html or rich text
    required: true,
    // todo: min and max lengths?
  },

  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },

  isPublished: {
    type: Boolean,
    required: true,
    default: false
  },

  comments: [{
    type: Schema.ObjectId,
    ref: 'Comment',
  }],
});

export default mongoose.model('Post', PostSchema);