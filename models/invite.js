import mongoose from "mongoose";
const Schema = mongoose.Schema;

const InviteSchema = new Schema({
  code: {
    type: String,
    required: true
  },

  isClaimed: {
    type: Boolean,
    required: true,
    default: false
  },

  claimedBy: {
    type: String,
    default: ''
  }
});

export default mongoose.model('Invite', InviteSchema);