import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrdersByUserId,
  getOrderById,
  updateOrder,
  deleteOrder,
  approveOrder,
  cancelOrder,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// Create an Order
orderRouter.post("/create/:userId", createOrder);

// Get All Orders
orderRouter.get("/all", getAllOrders);

// Get Orders by User ID
orderRouter.get("/user/:userId", getOrdersByUserId);

// Get Order by Order ID
orderRouter.get("/:orderId", getOrderById);

// Update Order
orderRouter.put("/:orderId", updateOrder);

// Delete Order
orderRouter.delete("/:orderId", deleteOrder);

//Approve order
orderRouter.put("/approveOrder/:orderId", approveOrder);

//Cancel Order
orderRouter.put("/cancelOrder/:orderId", cancelOrder);

export default orderRouter;
