// messageController.js
import Message from '../models/message.js';

const messageController = {
  getMessages: async (req, res) => {
    try {
      const recipientId = req.params.recipientId; // Get recipientId from URL params
      const currentUserId = req.query.currentUserId; // Get currentUserId from query params

      // Find messages either sent by or received by the current user
      const messages = await Message.find({
        $or: [
          { messageUser: currentUserId, recipient: recipientId },
          { messageUser: recipientId, recipient: currentUserId }
        ]
      }).populate('messageUser').sort('createdAt');
      
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Error fetching messages' });
    }
  },

  createMessage: async (req, res) => {
    try {
      const { content, recipientId, messageUser } = req.body; // Get messageUser from the request body
      const message = new Message({ content, messageUser, recipient: recipientId });
      await message.save();
      const populatedMessage = await Message.findById(message._id).populate('messageUser');
      res.status(201).json(populatedMessage);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Error creating message' });
    }
  }
};

export default messageController;
