import express, { request, response } from "express";
import { PORT } from "./config.js";
import { mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import cors from "cors";
import GPTRouter from "./routes/gpt_route.js";

//Route files
import userRouter from "./routes/userAuthenticationRoutes.js";
import bookRouter from "./routes/book_Routes.js";
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
import contactRouter from "./routes/contact_us_route.js";

import { RentalDurationRouter } from "./routes/rentalDurationRoutes.js";

//Create the app
const app = express();

//Middleware for parsing request body
app.use(express.json());

//Middleware for handling CORS Policy
app.use(cors());

//Configure app to run in port
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

//Connect DB
mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("Database connected.");

    // Root Configuration
    app.get("/", (request, response) => {
      response.status(200).send("Welocome to my game shop.");
    });
  })
  .catch(() => {
    console.error("Error connecting to MongoDB");
  });

//Routes
app.use("/books", bookRouter); //Books
app.use("/users", userRouter); //Users
app.use("/games", gameRouter); //Games
app.use("/gameCategories", GameCategoryRouter); //Game categories
app.use("/gameStocks", gameStockRouter); //GameStocks
app.use("/cart", cartRouter); //Cart
app.use("/cartItems", cartItemsRouter); //Cart Items
app.use("/orders", orderRouter); //Orders
app.use("/orderItems", OrderItemsRouter); //Order Items
app.use("/articles", articleRouter); //Articles
app.use("/feed", postRouter); //Post
app.use("/spookeyEditons", spookeyRouter); //Spookey_Game
app.use("/faq", faqRouter);
app.use("/gameStocks", gameStockRouter); //GameStocks
app.use("/cart", cartRouter); //Cart
app.use("/cartItems", cartItemsRouter); //Cart Items
app.use("/orders", orderRouter); //Orders
app.use("/orderItems", OrderItemsRouter); //Order Items
app.use("/articles", articleRouter); //Articles
app.use("/feed", postRouter); //Post
app.use("/ratings", ratingRouter);
app.use("/spookeyEditons", spookeyRouter); //Spookey_Game
app.use("/Rentals", RentalRouter); //Rentals
app.use("/api", chatRouter); // Use chatbot routes
app.use("/rentalDurations", RentalDurationRouter);
app.use("/api", GPTRouter);
app.use("/contacts", contactRouter);
