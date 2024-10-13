// message.js (Update the Message model)
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  messageUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }, // Add this field
});

const Message = mongoose.model('Message', messageSchema);

export default Message;