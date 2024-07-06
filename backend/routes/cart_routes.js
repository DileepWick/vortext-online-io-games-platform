import { createCart ,getCartByUserId} from "../controllers/cartController.js";
import express from "express";

const cartRouter = express.Router();

//Create cart
cartRouter.post("/createCart", createCart);

// get the cart by user ID
cartRouter.get('/getCartByUserId/:userId', getCartByUserId);

export default cartRouter;
