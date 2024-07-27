import { Order } from "../models/order.js";
import { Cart } from "../models/cart.js";
import { CartItems } from "../models/cartItems.js";
import { OrderItems } from "../models/orderItems.js";
import { GameStock } from "../models/gameStock.js";
import { User } from "../models/user.js";

// Create an Order
export const createOrder = async (req, res) => {
  const { userId } = req.params;
  const { paymentAmount } = req.body;

  try {
    const newOrder = new Order({
      user: userId,
      paymentAmount:paymentAmount,
    });

    const savedOrder = await newOrder.save();

    // Empty the cart items associated with the user
    const cart = await Cart.findOne({ owner: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    await CartItems.deleteMany({ cartid: cart._id });

    return res.json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error });
  }
};

// Get All Orders (pending)
export const getAllOrders = async (req, res) => {
  try {
    // Populate 'user' and 'item' fields based on their references
    const orders = await Order.find({
      orderStatus: { $in: ["Pending"] },
    }).populate("courier");

    res.status(200).json({
      allOrders: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Get All Orders (approved)
export const getAllOrdersApproved = async (req, res) => {
  try {
    // Populate 'user' and 'item' fields based on their references
    const orders = await Order.find({
      orderStatus: { $in: ["Approved"] },
    }).populate("courier");

    res.status(200).json({
      allOrders: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Get All Orders (Completed)
export const getAllOrdersCompleted = async (req, res) => {
  try {
    // Populate 'user' and 'item' fields based on their references
    const orders = await Order.find({
      orderStatus: { $in: ["Delivered"] },
    }).populate("courier");

    res.status(200).json({
      allOrders: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

//Get 'on delivery' orders
export const getAllOrdersOnDelivery = async (req, res) => {
  try {
    // Populate 'user' and 'item' fields based on their references
    const orders = await Order.find({
      orderStatus: { $in: ["On Delivery"] },
    }).populate("courier");

    res.status(200).json({
      allOrders: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};
//Get 'on delivery' orders
export const getAllDeliveredOrders = async (req, res) => {
  try {
    // Populate 'user' and 'item' fields based on their references
    const orders = await Order.find({
      orderStatus: { $in: ["Delivered"] },
    }).populate("courier");

    res.status(200).json({
      allOrders: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};
// Get Cancelled orders
export const getAllCancelledOrdes = async (req, res) => {
  try {
    // Populate 'user' and 'item' fields based on their references
    const orders = await Order.find({
      orderStatus: { $in: ["Canceled"] },
    }).populate("user", "_id username");

    res.status(200).json({
      allOrders: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Get Orders by User ID
export const getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ user: userId }).populate("user");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

// Get Orders assigned to a courier ('On Delivery')
export const getOrdersAssignedToCourier = async (req, res) => {
  const { userId } = req.params;
  try {
    // Fetch orders where the courier matches the userId and the status is "On Delivery"
    const orders = await Order.find({
      courier: userId,
      orderStatus: "On Delivery" // Filter by status
    }).populate("courier");

    res.status(200).json({ assignedOrders: orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

// Get Orders assigned to a courier ('On Delivery')
export const getCompletedOrdersAssignedToCourier = async (req, res) => {
  const { userId } = req.params;
  try {
    // Fetch orders where the courier matches the userId and the status is "On Delivery"
    const orders = await Order.find({
      courier: userId,
      orderStatus: "Delivered" // Filter by status
    }).populate("courier");

    res.status(200).json({ assignedOrders: orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};



// Get Order by Order ID
export const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId)
      .populate("user")
      .populate("cartItems");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error });
  }
};

// Update Order
export const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const updates = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updates, {
      new: true,
    });
    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error updating order", error });
  }
};

// Delete Order
export const deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder)
      return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error });
  }
};

//Approve order
export const approveOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const approveOrder = await Order.updateOne(
      { _id: orderId },
      { $set: { orderStatus: "Approved" } }
    );

    if (approveOrder.modifiedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order Approved" });
  } catch (error) {
    res.status(500).json({ message: "Error approving order.", error });
  }
};

//Cancel order
export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  try {
    const approveOrder = await Order.updateOne(
      { _id: orderId },
      { $set: { orderStatus: "Canceled", cancellationReason: reason } }
    );

    if (approveOrder.modifiedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find all order items for this order
    const orderItems = await OrderItems.find({ order: orderId });

    // Update stock for each order item
    for (const item of orderItems) {
      await GameStock.findByIdAndUpdate(item.stockid, {
        $inc: { NumberOfUnits: item.quantity },
      });
    }

    res.status(200).json({ message: "Order Canceled Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error canceling order.", error });
  }
};

//Assign courier
export const assignCourierToOrder = async (req, res) => {
  const { orderId } = req.params;
  const { courierId } = req.body;

  try {
    // Validate the input
    if (!orderId || !courierId) {
      return res
        .status(400)
        .json({ message: "Order ID and Courier ID are required" });
    }

    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the courier by ID
    const courier = await User.findById(courierId);
    if (!courier || courier.role !== "Courier" || courier.status !== "Free") {
      return res
        .status(400)
        .json({ message: "Invalid or unavailable courier" });
    }

    // Update the order with the courier information and change order status to 'On Delivery'
    order.courier = courierId;
    order.orderStatus = "On Delivery";

    // Save the updated order
    await order.save();

    res.status(200).json({ message: "Courier assigned successfully" });
  } catch (error) {
    console.error("Error assigning courier:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


//Complete order
export const CompleteOrder = async (req, res) => {
  const { orderId } = req.params;
  const { token } = req.body;

  try {
    // Find the order by orderId
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the provided token matches the order's token
    if (order.orderCompletionCode !== token) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Update the order status to 'Delivered'
    order.orderStatus = 'Delivered';
    await order.save();

    return res.status(200).json({ message: 'Order Delivered Successfully !',order:order });
  } catch (error) {
    console.error('Error completing order:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
