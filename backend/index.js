import express, { request, response } from "express";
import { PORT } from "./config.js";
import { mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import GPTRouter from "./routes/gpt_route.js";

//Route files
import userRouter from "./routes/userAuthenticationRoutes.js";
import gameRouter from "./routes/game_Routes.js";
import GameCategoryRouter from "./routes/Game_Category_Routes.js";
import gameStockRouter from "./routes/Game_Stock_Routes.js";
import cartRouter from "./routes/cart_routes.js";
import cartItemsRouter from "./routes/cart_Items_Route.js";
import orderRouter from "./routes/order_Routes.js";
import OrderItemsRouter from "./routes/order_items_route.js";
import articleRouter from "./routes/article_routes.js";
import postRouter from "./routes/communityPost_routes.js";
import ratingRouter from "./routes/rating_routes.js";
import spookeyRouter from "./routes/spookey_guesses_routes.js";
import faqRouter from "./routes/faq_routes.js";
import RentalRouter from "./routes/rental_routes.js";
import chatRouter from "./routes/chat_bot_route.js";
import rentalPaymentsRouter from "./routes/rentalPaymentRoutes.js";
import MathzBlasterScore from "./routes/math_blaster_routes.js";
import CommunityPost from "./routes/communityPost_routes.js";
import contactRouter from "./routes/contact_us_route.js";
import messageRoutes from "./routes/messageRoutes.js";
import DirectContactUsRoute from "./routes/direct_contact_us_route.js";
import { RentalDurationRouter } from "./routes/rentalDurationRoutes.js";
import distributedPaymentRoutes from "./routes/distributedPayment_routes.js";
import NotificationRouter from "./routes/notification_routes.js";
import rockPaperScissorsRouter from "./routes/rock_paper_scissors_routes.js";

//Create the app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://127.0.0.1:5000", "http://localhost:3001"], // Add your frontend URLs
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store active users and their socket IDs
const activeUsers = new Map();

// Make io and activeUsers accessible to routes
app.set("io", io);
app.set("activeUsers", activeUsers);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user joining
  socket.on("join", (userId) => {
    activeUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} joined with socket ${socket.id}`);
  });

  // Handle new message
  socket.on("sendMessage", async (messageData) => {
    try {
      const { recipientId, content, messageUser } = messageData;

      // Emit to recipient if they're online
      const recipientSocketId = activeUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("newMessage", {
          ...messageData,
          _id: Date.now().toString(), // Temporary ID
          createdAt: new Date(),
        });
      }

      // Emit back to sender for confirmation
      socket.emit("messageConfirmed", {
        ...messageData,
        _id: Date.now().toString(),
        createdAt: new Date(),
      });

      // Update unread counts for recipient
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("updateUnreadCount", {
          senderId: messageUser,
          increment: true,
        });
      }
    } catch (error) {
      console.error("Error handling sendMessage:", error);
    }
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    const { recipientId, isTyping } = data;
    const recipientSocketId = activeUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("userTyping", {
        userId: socket.userId,
        isTyping,
      });
    }
  });

  // Handle message read
  socket.on("markAsRead", (data) => {
    const { senderId } = data;
    const senderSocketId = activeUsers.get(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageRead", {
        readBy: socket.userId,
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

//Middleware for parsing request body
app.use(express.json());

//Middleware for handling CORS Policy
app.use(
  cors({
    origin: ["http://127.0.0.1:5000", "http://localhost:3001"],
    credentials: true,
  })
);

//Connect DB
mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("Database connected.");

    // Root Configuration
    app.get("/", (request, response) => {
      response.status(200).send("Welcome to my game shop.");
    });

    // Configure app to run in port
    server.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

//Routes
app.use("/users", userRouter);
app.use("/games", gameRouter);
app.use("/gameCategories", GameCategoryRouter);
app.use("/gameStocks", gameStockRouter);
app.use("/cart", cartRouter);
app.use("/cartItems", cartItemsRouter);
app.use("/orders", orderRouter);
app.use("/orderItems", OrderItemsRouter);
app.use("/articles", articleRouter);
app.use("/feed", postRouter);
app.use("/spookeyEditons", spookeyRouter);
app.use("/faq", faqRouter);
app.use("/community", CommunityPost);
app.use("/ratings", ratingRouter);
app.use("/Rentals", RentalRouter);
app.use("/api", chatRouter);
app.use("/rentalDurations", RentalDurationRouter);
app.use("/rentalPayments", rentalPaymentsRouter);
app.use("/mathzblaster", MathzBlasterScore);
app.use("/directContactUs", DirectContactUsRoute);
app.use("/api", GPTRouter);
app.use("/contacts", contactRouter);
app.use("/api/messages", messageRoutes);
app.use("/notifications", NotificationRouter);
app.use("/api/distributed-payments", distributedPaymentRoutes);
app.use("/api/rock-paper-scissors", rockPaperScissorsRouter);

export { io, activeUsers };
