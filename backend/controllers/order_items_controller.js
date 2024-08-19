import { OrderItems } from "../models/orderItems.js";
import { Order } from "../models/order.js";

// Create a new order item
export const createOrderItem = async (req, res) => {
  try {
    const { order, stockid, price } = req.body;

    // Validate input
    if (!order || !stockid || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new order item
    const newOrderItem = new OrderItems({
      order,
      stockid,
      price,
    });

    // Save the order item to the database
    const savedOrderItem = await newOrderItem.save();

    res.status(201).json(savedOrderItem);
  } catch (error) {
    console.error("Error creating order item:", error);
    res.status(500).json({ message: "Error creating order item" });
  }
};


// Get all order items
export const getAllOrderItems = async (req, res) => {
  try {
    const orderItems = await OrderItems.find()
      .populate({
        path: "stockid",
        populate: {
          path: "AssignedGame", // Populate all fields of AssignedGame
        }
      })
      .populate({
        path: "order",
        populate: {
          path: "user", // Populate all fields of user
        }
      });

    res.status(200).json({
      orderHistory: orderItems,
    });
  } catch (error) {
    console.error("Error fetching order items:", error);
    res.status(500).json({ message: "Error fetching order items" });
  }
};


// Get order items by order ID
export const getOrderItemsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validate order ID
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const orderItems = await OrderItems.find({ order: orderId })
      .populate("order")
      .populate({
        path: "stockid",
        populate: {
          path: "AssignedGame",
          model: "Game",
        },
      });

    if (orderItems.length === 0) {
      return res.status(404).json({ message: "Order items not found" });
    }

    res.status(200).json(orderItems);
  } catch (error) {
    console.error("Error fetching order items by order ID:", error);
    res.status(500).json({ message: "Error fetching order items" });
  }
};

// Check if a specific item is already in the user's library
export const checkLibraryItem = async (req, res) => {
  try {
    const { stockid } = req.params;
    const {userId} = req.params; 

    // Validate stock ID
    if (!stockid) {
      return res.status(400).json({ message: "Stock ID is required" });
    }

    // Validate user ID
    if (!userId) {
      return res.status(401).json({ message: "User ID is required" });
    }

    // Find all orders by user ID
    const orders = await Order.find({ user: userId });

    if (orders.length === 0) {
      return res.status(404).json({ message: "Orders not found for the user" });
    }

    // Extract order IDs
    const orderIds = orders.map((order) => order._id);

    // Find order items by order IDs and stock ID
    const libraryItems = await OrderItems.find({
      order: { $in: orderIds },
      stockid: stockid,
    })
      .populate({
        path: "stockid",
        populate: {
          path: "AssignedGame",
          model: "Game",
        },
      })
      .populate("order");

    if (libraryItems.length === 0) {
      return res
        .status(404)
        .json({ message: "You have not purchased this item yet" });
    }

    res
      .status(200)
      .json({ message: "You already own this item", items: libraryItems });
  } catch (error) {
    console.error("Error fetching order items by user ID and stock ID:", error);
    res.status(500).json({ message: "Error fetching order items status 500" });
  }
};

// Update an order item by ID
export const updateOrderItemById = async (req, res) => {
  try {
    const { orderItemId } = req.params;
    const { order, stockid, quantity, price } = req.body;

    // Validate input
    if (!order || !stockid || !quantity || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find and update the order item
    const updatedOrderItem = await OrderItems.findByIdAndUpdate(
      orderItemId,
      { order, stockid, quantity, price },
      { new: true }
    );

    if (!updatedOrderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    res.status(200).json(updatedOrderItem);
  } catch (error) {
    console.error("Error updating order item:", error);
    res.status(500).json({ message: "Error updating order item" });
  }
};

// Delete an order item by ID
export const deleteOrderItemById = async (req, res) => {
  try {
    const { orderItemId } = req.params;

    // Find and delete the order item
    const deletedOrderItem = await OrderItems.findByIdAndDelete(orderItemId);

    if (!deletedOrderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    res.status(200).json({ message: "Order item deleted successfully" });
  } catch (error) {
    console.error("Error deleting order item:", error);
    res.status(500).json({ message: "Error deleting order item" });
  }
};

// Get order items by user ID
export const getOrderItemsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find all orders by user ID
    const orders = await Order.find({ user: userId });

    if (orders.length === 0) {
      return res.status(404).json({ message: "Orders not found for the user" });
    }

    // Extract order IDs
    const orderIds = orders.map((order) => order._id);

    // Find all order items by order IDs and populate stockid and assignedGame fields
    const orderItems = await OrderItems.find({ order: { $in: orderIds } })
      .populate({
        path: "stockid",
        populate: {
          path: "AssignedGame",
          model: "Game",
        },
      })
      .populate("order");

    if (orderItems.length === 0) {
      return res
        .status(404)
        .json({ message: "Order items not found for the user" });
    }

    res.status(200).json(orderItems);
  } catch (error) {
    console.error("Error fetching order items by user ID:", error);
    res.status(500).json({ message: "Error fetching order items" });
  }
};
