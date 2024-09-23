// controllers/messageController.js
import { Message } from "../models/message.js";

export const sendMessage = async (req, res) => {
  try {
    const { senderId, recipientId, content } = req.body;

    const newMessage = new Message({
      sender: senderId,
      recipient: recipientId,
      content: content
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully", data: newMessage });
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
};