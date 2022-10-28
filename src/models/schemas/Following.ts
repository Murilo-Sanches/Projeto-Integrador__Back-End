import mongoose from 'mongoose';

import IFollowing from '../interfaces/IFollowing';

const followingSchema = new mongoose.Schema({
  // owner: {
  //   type: mongoose.Types.ObjectId,
  //   ref: 'User',
  // },
  following: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'User',
    },
  ],
});

const Following = mongoose.model<IFollowing>('Following', followingSchema);

export default Following;
