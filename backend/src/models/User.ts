import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  lastActive: Date;
  chatId?: string | null;
}

const userSchema: Schema = new Schema(
  {
    telegramId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: false,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    chatId: {
      type: String,
      required: false,
      sparse: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', userSchema); 