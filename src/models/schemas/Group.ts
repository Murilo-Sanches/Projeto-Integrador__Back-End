import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    members: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    banned: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Group = mongoose.model('Group', groupSchema);
export default Group;
