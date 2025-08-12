import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IAttachment {
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  filename?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface IReaction {
  reaction: string;
  createdAt: string;
}

export interface IMessage extends Document {
  telegramMessageId?: number;
  user: mongoose.Types.ObjectId | IUser;
  text?: string;
  attachments?: IAttachment[];
  isFromAdmin: boolean;
  read: boolean;
  replyTo?: mongoose.Types.ObjectId | IMessage;
  reactions?: IReaction[];
  deleted?: boolean;
}

const attachmentSchema = new Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'file'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  filename: String,
  fileSize: Number,
  mimeType: String,
});

const reactionSchema = new Schema({
  reaction: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

const messageSchema: Schema = new Schema(
  {
    telegramMessageId: {
      type: Number,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
    },
    attachments: [attachmentSchema],
    isFromAdmin: {
      type: Boolean,
      default: false,
    },
    read: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    reactions: [reactionSchema],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMessage>('Message', messageSchema); 