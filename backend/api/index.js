import express, { request, response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import GPTRouter from "../routes/gpt_route.js";
import session from "express-session";
import passport from "passport";
import "../middleware/passport.js"; // Import passport middleware

//Route files
import userRouter from "../routes/userAuthenticationRoutes.js";
import gameRouter from "../routes/game_Routes.js";
import GameCategoryRouter from "../routes/Game_Category_Routes.js";
import gameStockRouter from "../routes/Game_Stock_Routes.js";
import cartRouter from "../routes/cart_routes.js";
import cartItemsRouter from "../routes/cart_Items_Route.js";
import orderRouter from "../routes/order_Routes.js";
import OrderItemsRouter from "../routes/order_items_route.js";
import articleRouter from "../routes/article_routes.js";
import postRouter from "../routes/communityPost_routes.js";
import ratingRouter from "../routes/rating_routes.js";
import spookeyRouter from "../routes/spookey_guesses_routes.js";
import faqRouter from "../routes/faq_routes.js";
import RentalRouter from "../routes/rental_routes.js";
import chatRouter from "../routes/chat_bot_route.js";
import rentalPaymentsRouter from "../routes/rentalPaymentRoutes.js";
import MathzBlasterScore from "../routes/math_blaster_routes.js";
import CommunityPost from "../routes/communityPost_routes.js";
import contactRouter from "../routes/contact_us_route.js";
import messageRoutes from "../routes/messageRoutes.js";
import DirectContactUsRoute from "../routes/direct_contact_us_route.js";
import { RentalDurationRouter } from "../routes/rentalDurationRoutes.js";
import distributedPaymentRoutes from "../routes/distributedPayment_routes.js";
import NotificationRouter from "../routes/notification_routes.js";
import rockPaperScissorsRouter from "../routes/rock_paper_scissors_routes.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 8098;
const mongoDBURL = process.env.MONGO_URI;
//Create the app
const app = express();

//Middleware for parsing request body
app.use(express.json());

//Middleware for handling CORS Policy
app.use(
  cors({
    origin: ["http://127.0.0.1:5000", "https://vortexiogaming.vercel.app"],
    credentials: true,
  })
);

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect DB
mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("Database connected.");
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

// Set up session management
app.use("/auth", userRouter);

// Serve static files from the 'public' directory
app.get("/", (req, res) => {
  res.send("Welcome to the IoGames API!");
});

// Create an HTTP server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
