import express from "express";
import {
  createCartItem,
  updateCartItemByStockId,
  deleteCartItemByStockId,
  getCartItemsByUserId,
  getCartItemsByCartId
} from "../controllers/cartItemsController.js";


const cartItemsRouter = express.Router();

// Route to create a new cart item
cartItemsRouter.post("/createCartItem", createCartItem);

// Route to update a cart item
cartItemsRouter.put("/updateCartItem/:stockId", updateCartItemByStockId);

// Route to get all cart items
cartItemsRouter.get("/getCartItemsByUserId/:userId", getCartItemsByUserId);

// Route to get all cart items
cartItemsRouter.get("/ItemCart/getCartItemsByCartId/:cartid", getCartItemsByCartId);

// Route to delete a cart item
cartItemsRouter.delete("/deleteCartItem/:stockId", deleteCartItemByStockId);

export default cartItemsRouter;
