// This should be in your main server file or a separate socket handler file

import { Server } from "socket.io";
import Message from "./models/message.js"; // Adjust path as needed

export const setupSocket = (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://127.0.0.1:5000",
        "https://vortex-frontend-jet.vercel.app/",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Store active users and their socket IDs
  const activeUsers = new Map();

  // Make io and activeUsers available to routes
  app.set("io", io);
  app.set("activeUsers", activeUsers);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining
    socket.on("join", (userId) => {
      console.log(`User ${userId} joined with socket ${socket.id}`);
      activeUsers.set(userId, socket.id);
      socket.userId = userId;

      // Notify others that user is online
      socket.broadcast.emit("userOnline", userId);

      // Send current online users to the newly connected user
      const onlineUserIds = Array.from(activeUsers.keys());
      socket.emit("onlineUsers", onlineUserIds);
    });

    // Handle sending messages via socket
    socket.on("sendMessage", async (messageData) => {
      try {
        console.log("Received message via socket:", messageData);

        // Get recipient socket ID
        const recipientSocketId = activeUsers.get(messageData.recipientId);

        if (recipientSocketId) {
          // Send message to recipient
          io.to(recipientSocketId).emit("newMessage", messageData);
          console.log(`Message sent to recipient ${messageData.recipientId}`);

          // Update unread count for recipient
          io.to(recipientSocketId).emit("updateUnreadCount", {
            senderId: messageData.messageUser._id || messageData.messageUser,
            increment: true,
          });
        } else {
          console.log(`Recipient ${messageData.recipientId} is not online`);
        }

        // Confirm message was processed
        socket.emit("messageConfirmed", messageData);
      } catch (error) {
        console.error("Error handling socket message:", error);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing", ({ recipientId, isTyping }) => {
      const recipientSocketId = activeUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("userTyping", {
          userId: socket.userId,
          isTyping,
        });
      }
    });

    // Handle marking messages as read
    socket.on("markAsRead", async ({ senderId }) => {
      try {
        const result = await Message.updateMany(
          { messageUser: senderId, recipient: socket.userId, read: false },
          { $set: { read: true } }
        );

        // Notify sender that messages were read
        const senderSocketId = activeUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesRead", {
            readBy: socket.userId,
          });
        }

        // Confirm to the user
        socket.emit("messagesMarkedAsRead", {
          senderId,
          count: result.modifiedCount,
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
        socket.emit("markAsReadError", {
          error: "Failed to mark messages as read",
        });
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);

      if (socket.userId) {
        activeUsers.delete(socket.userId);

        // Notify others that user is offline
        socket.broadcast.emit("userOffline", socket.userId);

        // Stop any typing indicators
        socket.broadcast.emit("userTyping", {
          userId: socket.userId,
          isTyping: false,
        });
      }
    });

    // Handle connection errors
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
};
