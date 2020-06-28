import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema(
  {
    senderId: {
      type: Number,
      required: true,
    },
    receiverId: {
      type: Number,
      required: true,
    },
    messages: [
      {
        user: {
          type: Number,
          required: true,
        },
        message: { type: mongoose.Schema.Types.String, required: true },
      },
    ],
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { collection: 'chat', timestamps: true }
);

export default mongoose.model('Chat', ChatSchema);
