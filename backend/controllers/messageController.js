import Message from '../models/message.js';

const messageController = {
  getMessages: async (req, res) => {
    try {
      const messages = await Message.find().populate('messageUser');
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching messages' });
    }
  },

  createMessage: async (req, res) => {
    try {
      const { content, userId } = req.body;
      const message = new Message({ content, messageUser: userId });
      await message.save();
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: 'Error creating message' });
    }
  },
};

export default messageController;