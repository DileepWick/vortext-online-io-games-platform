import express from 'express';
import {
  createOrderItem,
  getAllOrderItems,
  getOrderItemsByOrderId,
  updateOrderItemById,
  deleteOrderItemById,
  getOrderItemsByUserId,
  checkLibraryItem
} from '../controllers/order_items_controller.js';

const OrderItemsRouter = express.Router();

// Create a new order item
OrderItemsRouter.post('/', createOrderItem);

// Get all order items
OrderItemsRouter.get('/', getAllOrderItems);

//CheckLibraryItem
OrderItemsRouter.get('/checkItem/:stockid/:userId',checkLibraryItem);

// Get order items by order ID
OrderItemsRouter.get('/order/:orderId', getOrderItemsByOrderId);

// Get order items by user ID
OrderItemsRouter.get('/useOrders/:userId', getOrderItemsByUserId);

// Update an order item by ID
OrderItemsRouter.put('/:orderItemId', updateOrderItemById);

// Delete an order item by ID
OrderItemsRouter.delete('/:orderItemId', deleteOrderItemById);





export default OrderItemsRouter;
