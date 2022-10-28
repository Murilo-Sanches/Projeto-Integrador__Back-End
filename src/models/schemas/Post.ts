import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uma postagem deve pertencer a um usuário'],
    },
    text: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    likes: {
      type: mongoose.Types.ObjectId,
      ref: 'Likes',
    },
    dislikes: {
      type: mongoose.Types.ObjectId,
      ref: 'Dislikes',
    },
    // comments: {
    //   type: mongoose.Types.ObjectId,
    //   ref: 'Comment',
    // },
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
// postSchema.index({ created_at: -1, likes: 1 });
// Criar index em campos frequentemente buscados para obter performace. Use explain() em uma query para ver estatísticas
// Com indexes o mongodb não precisa escanear todos os documentos

/* 
  Virtual populate é um jeito de implementar parent referecing sem de fato 
  precisar armazenar um array com os ids do campo. Assim Post pode "armazenar"
  um array virtual com todos os seus comentários
*/
postSchema.virtual('comments', {
  ref: 'Comment', // Referenciando na model Comment
  foreignField: 'target', // O campo na model Comment que refencia o post ~ basicamente onde o id do post está
  localField: '_id', //  O id que serve para identificar o post
});

const Post = mongoose.model('Post', postSchema);
export default Post;
