import mongoose from "mongoose";
const Schema = mongoose.Schema;

const InviteSchema = new Schema({
  code: {
    type: String,
    required: true
  },

  generatedBy: {
    type: Schema.ObjectId,
    ref: 'Author',
    required: true
  },

  claimedBy: {
    type: Schema.ObjectId,
    ref: 'Invitee',
    default: null
  }
});

export default mongoose.model('Invite', InviteSchema);