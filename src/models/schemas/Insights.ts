import mongoose from 'mongoose';

const insighstSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
    target: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
    },
    insights: {
      type: String,
      enum: ['like', 'dislike'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Insights = mongoose.model('Insights', insighstSchema);
export default Insights;
