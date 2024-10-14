import mongoose from 'mongoose';
import Message from '../models/message.js';

const messageController = {
  getMessages: async (req, res) => {
    try {
      const recipientId = req.params.recipientId;
      const currentUserId = req.query.currentUserId;

      const messages = await Message.find({
        $or: [
          { messageUser: currentUserId, recipient: recipientId },
          { messageUser: recipientId, recipient: currentUserId }
        ]
      }).populate('messageUser').sort('createdAt');
      
      // Mark messages as read
      await Message.updateMany(
        { messageUser: recipientId, recipient: currentUserId, read: false },
        { $set: { read: true } }
      );

      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Error fetching messages' });
    }
  },

  createMessage: async (req, res) => {
    try {
      const { content, recipientId, messageUser } = req.body;
      const message = new Message({ content, messageUser, recipient: recipientId, read: false });
      await message.save();
      const populatedMessage = await Message.findById(message._id).populate('messageUser');
      res.status(201).json(populatedMessage);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Error creating message' });
    }
  },

  getUnreadMessageCounts: async (req, res) => {
    try {
      const currentUserId = req.params.userId;
      const unreadCounts = await Message.aggregate([
        { $match: { recipient: new mongoose.Types.ObjectId(currentUserId), read: false } },
        { $group: { _id: '$messageUser', count: { $sum: 1 } } }
      ]);
      res.json(unreadCounts);
    } catch (error) {
      console.error('Error fetching unread message counts:', error);
      res.status(500).json({ error: 'Error fetching unread message counts' });
    }
  }
};

export default messageController;