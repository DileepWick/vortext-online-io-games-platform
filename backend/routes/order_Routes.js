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
  getAllCancelledOrdes,
  assignCourierToOrder,
  getAllOrdersApproved,
  getAllOrdersOnDelivery,
  getOrdersAssignedToCourier,
  getCompletedOrdersAssignedToCourier,
  CompleteOrder,
  getAllOrdersCompleted
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// Create an Order
orderRouter.post("/create/:userId", createOrder);

// Get All Orders
orderRouter.get("/all", getAllOrders);

//Get approved orders
orderRouter.get("/approvedOrders",getAllOrdersApproved);

//Get all cancelled orders
orderRouter.get("/allCanceledOrders",getAllCancelledOrdes);

//All on deliver orders
orderRouter.get("/onDeliveryOrders",getAllOrdersOnDelivery );

//All completed Orders
orderRouter.get("/AllCompletedOrders",getAllOrdersCompleted);

// Get Orders by User ID
orderRouter.get("/user/:userId", getOrdersByUserId);

//Get orders for assigned couriers ('On Delivery')
orderRouter.get("/courier/currentOrders/:userId",getOrdersAssignedToCourier);

//Get completed orders for assigned courier
orderRouter.get("/courier/CompletedOrders/:userId",getCompletedOrdersAssignedToCourier);

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

//Assign Order
orderRouter.put("/assignCourier/:orderId", assignCourierToOrder);

//Complete Order
orderRouter.put("/completeOrder/:orderId",CompleteOrder);

export default orderRouter;
