import { Order } from "../models/order.js";
import { Cart } from "../models/cart.js";
import { customAlphabet } from "nanoid";
import { CartItems } from "../models/cartItems.js";

// Custom alphabet for generating a unique 4-length code (letters and numbers)
const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 6);

// Create an Order
export const createOrder = async (req, res) => {
  const { userId } = req.params;
  const { shippingAddress, region, paymentAmount } = req.body;

  try {
    const newOrder = new Order({
      user: userId,
      shippingAddress,
      region,
      paymentAmount,
      orderCompletionCode: nanoid(),
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

// Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    // Populate 'user' and 'item' fields based on their references
    const orders = await Order.find({})
      .populate("user", "_id username");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Get Orders by User ID
export const getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ user: userId }).populate('user');
    res.status(200).json(orders);
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
