import mongoose from "mongoose";
import Message from "../models/message.js";

const messageController = {
  getMessages: async (req, res) => {
    try {
      const recipientId = req.params.recipientId;
      const currentUserId = req.query.currentUserId;

      console.log(
        `Fetching messages between ${currentUserId} and ${recipientId}`
      );

      const messages = await Message.find({
        $or: [
          { messageUser: currentUserId, recipient: recipientId },
          { messageUser: recipientId, recipient: currentUserId },
        ],
      })
        .populate("messageUser")
        .sort("createdAt");

      console.log(`Found ${messages.length} messages`);

      // Mark messages as read
      await Message.updateMany(
        { messageUser: recipientId, recipient: currentUserId, read: false },
        { $set: { read: true } }
      );

      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Error fetching messages" });
    }
  },

  createMessage: async (req, res) => {
    try {
      const { content, recipientId, messageUser } = req.body;

      // Validate required fields
      if (!content || !recipientId || !messageUser) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      console.log(`Creating message from ${messageUser} to ${recipientId}`);

      const message = new Message({
        content,
        messageUser,
        recipient: recipientId,
        read: false,
      });

      await message.save();
      const populatedMessage = await Message.findById(message._id).populate(
        "messageUser"
      );

      console.log("Message created:", populatedMessage);

      // Get Socket.IO instance and activeUsers from app locals
      const io = req.app.get("io");
      const activeUsers = req.app.get("activeUsers");

      // Emit to recipient if they're online
      if (io && activeUsers) {
        const recipientSocketId = activeUsers.get(recipientId);

        if (recipientSocketId) {
          console.log(`Emitting message to recipient ${recipientId}`);
          io.to(recipientSocketId).emit("newMessage", populatedMessage);

          // Update unread count for recipient
          io.to(recipientSocketId).emit("updateUnreadCount", {
            senderId: messageUser,
            increment: true,
          });
        } else {
          console.log(`Recipient ${recipientId} is not online`);
        }
      }

      // Return the message immediately to the sender
      res.status(201).json(populatedMessage);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Error creating message" });
    }
  },

  getUnreadMessageCounts: async (req, res) => {
    try {
      const currentUserId = req.params.userId;

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const unreadCounts = await Message.aggregate([
        {
          $match: {
            recipient: new mongoose.Types.ObjectId(currentUserId),
            read: false,
          },
        },
        { $group: { _id: "$messageUser", count: { $sum: 1 } } },
      ]);

      res.json(unreadCounts);
    } catch (error) {
      console.error("Error fetching unread message counts:", error);
      res.status(500).json({ error: "Error fetching unread message counts" });
    }
  },

  markMessagesAsRead: async (req, res) => {
    try {
      const { senderId } = req.body;
      const currentUserId = req.query.currentUserId;

      // Validate required fields
      if (!senderId || !currentUserId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate ObjectIds
      if (
        !mongoose.Types.ObjectId.isValid(senderId) ||
        !mongoose.Types.ObjectId.isValid(currentUserId)
      ) {
        return res.status(400).json({ error: "Invalid user IDs" });
      }

      console.log(
        `Marking messages from ${senderId} to ${currentUserId} as read`
      );

      const result = await Message.updateMany(
        { messageUser: senderId, recipient: currentUserId, read: false },
        { $set: { read: true } }
      );

      console.log(`Marked ${result.modifiedCount} messages as read`);

      // Get Socket.IO instance and activeUsers from app locals
      const io = req.app.get("io");
      const activeUsers = req.app.get("activeUsers");

      // Notify sender that messages were read
      if (io && activeUsers) {
        const senderSocketId = activeUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesRead", {
            readBy: currentUserId,
          });
        }
      }

      res.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Error marking messages as read" });
    }
  },
};

export default messageController;
