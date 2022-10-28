import { Types, Document } from 'mongoose';

interface IFollowing extends Document {
  // owner: string;
  // following: Array<string>;
  following: Array<Types.ObjectId>;
}

export default IFollowing;
