// messageController.js
import Message from '../models/message.js';

const messageController = {
  getMessages: async (req, res) => {
    try {
      const { userId, currentUserId } = req.body; // Get both user IDs from the request body
      const messages = await Message.find({
        $or: [
          { messageUser: currentUserId, recipient: userId },
          { messageUser: userId, recipient: currentUserId }
        ]
      }).populate('messageUser').sort('createdAt');
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error); // Log the actual error
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
      console.error('Error creating message:', error); // Log the actual error
      res.status(500).json({ error: 'Error creating message' });
    }
  },


  getMessagesByUser: async (req, res) => {
    try {
      const { userId } = req.params; // Get userId from route params
      const messages = await Message.find({
        $or: [
          { messageUser: userId },
          { recipient: userId }
        ]
      }).populate('messageUser recipient').sort('createdAt'); // Populate both messageUser and recipient
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages by user:', error);
      res.status(500).json({ error: 'Error fetching messages by user' });
    }
  },
  
  
};

export default messageController;
