import { CartItems } from "../models/cartItems.js";
import { Cart } from "../models/cart.js";
import { GameStock } from "../models/gameStock.js";

export const createCartItem = async (req, res) => {
  try {
    const { cartid, stockid, quantity } = req.body;

    // Validate input
    if (!cartid || !stockid || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the cart exists
    const cart = await Cart.findById(cartid);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if the game stock exists
    const gameStock = await GameStock.findById(stockid);
    if (!gameStock) {
      return res.status(404).json({ message: "Game stock not found" });
    }

    // Check if there is enough stock available
    if (gameStock.NumberOfUnits < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Check if the item already exists in the cart
    const existingCartItem = await CartItems.findOne({ cartid, stockid });

    if (existingCartItem) {
      // Item is already in the cart
      return res.status(222).json({ message: "Item already in the cart" });
    } else {
      // Otherwise, create a new cart item
      const total = gameStock.UnitPrice * quantity;

      // Add the new cart item
      await CartItems.create({
        cartid,
        stockid,
        quantity,
        total,
      });

      // Subtract the quantity from the game stock and save the updated game stock
      gameStock.NumberOfUnits -= quantity;
      await gameStock.save();

      return res.status(201).json({ message: "Game added to cart " });
    }

  } catch (error) {
    console.error("Error creating cart item:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get all cart items by user ID
export const getCartItemsByUserId = async (req, res) => {
  try {
    // Extract user ID from request parameters
    const { userId } = req.params;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the cart associated with the user ID
    const cart = await Cart.findOne({ owner: userId });

    // If no cart is found, return appropriate message
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find all cart items for the found cart
    const cartItems = await CartItems.find({ cartid: cart._id })
      .populate("stockid")
      .populate({
        path: "stockid",
        populate: {
          path: "AssignedGame",
          model: "Game",
        },
      });

    // Return the cart items
    res.status(200).json({ cartItems });
  } catch (error) {
    console.error("Error fetching cart items by user ID:", error);
    res.status(500).json({ message: "Error fetching cart items" });
  }
};

// Update cart item quantity by stock ID
export const updateCartItemByStockId = async (req, res) => {
  try {
    const { stockId } = req.params;
    const { quantity } = req.body;

    // Validate input
    if (!stockId || quantity === undefined) {
      return res
        .status(400)
        .json({ message: "Stock ID and quantity are required" });
    }

    // Find the cart item by stock ID and populate the stockid field
    const cartItem = await CartItems.findOne({ stockid: stockId }).populate(
      "stockid"
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Fetch the relevant GameStock document
    const gameStock = await GameStock.findById(stockId);

    if (!gameStock) {
      return res.status(404).json({ message: "Game stock not found" });
    }

    // Calculate the difference between the new quantity and the current quantity
    const quantityDifference = quantity - cartItem.quantity;

    // Check if there is enough stock available for the increase
    if (
      quantityDifference > 0 &&
      gameStock.NumberOfUnits < quantityDifference
    ) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    // Update the quantity and total in the cart item
    cartItem.quantity = quantity;
    cartItem.total = cartItem.stockid.UnitPrice * quantity;

    // Save the updated cart item
    const updatedCartItem = await cartItem.save();

    // Update the stock units after the cart item is successfully saved
    gameStock.NumberOfUnits -= quantityDifference;
    await gameStock.save();

    res.status(200).json(updatedCartItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Error updating cart item" });
  }
};

// Delete cart item by stock ID
export const deleteCartItemByStockId = async (req, res) => {
  try {
    const { stockId } = req.params;

    // Find the cart item by stock ID
    const cartItem = await CartItems.findOne({ stockid: stockId });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Fetch the relevant GameStock document
    const gameStock = await GameStock.findById(stockId);

    if (!gameStock) {
      return res.status(404).json({ message: "Game stock not found" });
    }

    // Add the quantity of the deleted cart item back to the stock
    gameStock.NumberOfUnits += cartItem.quantity;
    await gameStock.save();

    // Delete the cart item
    await CartItems.findByIdAndDelete(cartItem._id);

    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ message: "Error deleting cart item" });
  }
};

// Get all cart items by cart ID
export const getCartItemsByCartId = async (req, res) => {
  try {
    // Extract cart ID from request parameters
    const { cartid } = req.params;

    // Validate cart ID
    if (!cartid) {
      return res.status(400).json({ message: "Cart ID is required" });
    }

    // Find all cart items for the given cart ID
    const cartItems = await CartItems.find({ cartid });

    // Return the cart items
    res.status(200).json({ cartItems });
  } catch (error) {
    console.error("Error fetching cart items by cart ID:", error);
    res.status(500).json({ message: "Error fetching cart items" });
  }
};
