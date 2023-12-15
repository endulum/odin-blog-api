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

  fullName: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Author', AuthorSchema);