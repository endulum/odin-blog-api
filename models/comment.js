import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  post: { type: Schema.ObjectId, ref: 'Post', required: true },
  commentBy: { type: String, required: true, minLength: 2, maxLength: 32 },
  commentText: { type: String, required: true, minLength: 2, maxLength: 512 },
  datePosted: { type: Date, default: () => Date.now(), immutable: true },
});

export default mongoose.model('Comment', CommentSchema);