import mongoose from 'mongoose';

const pinSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    target: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Pin = mongoose.model('Pin', pinSchema);
export default Pin;
