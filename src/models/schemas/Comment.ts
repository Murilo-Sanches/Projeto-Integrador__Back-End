import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Um comentário deve pertencer a um usuário'],
    },
    target: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Um comentário deve pertencer a uma postagem'],
    },
    text: {
      type: String,
    },
    likes: {
      type: mongoose.Types.ObjectId,
      ref: 'Likes',
    },
    dislikes: {
      type: mongoose.Types.ObjectId,
      ref: 'Dislikes',
    },
    comments: {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
    },
    status: {
      type: String,
      enum: ['public', 'friends', 'invisible'],
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

// commentSchema.pre(/^find/, async function (next) {
//   await this.populate({
//     path: 'creator',
//     select: 'username name profile_picture background_photo biography status',
//   }).populate({
//     path: 'target',
//     select: 'id',
//   });
//   next();
// });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
