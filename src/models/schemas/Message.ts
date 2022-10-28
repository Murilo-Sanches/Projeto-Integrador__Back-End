import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    writter: {
      type: String,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    group: {
      type: mongoose.Types.ObjectId,
      ref: 'Group',
      default: null,
    },
    text: {
      type: String,
      maxlength: [1000, 'Uma mensagem não pode ultrapassar 1000 caracteres'],
    },
    status: {
      type: String,
      enum: ['public', 'deleted'],
      default: 'public',
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

const Message = mongoose.model('Message', messageSchema);
export default Message;
