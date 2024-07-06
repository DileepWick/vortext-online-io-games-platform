import { Cart } from "../models/cart.js";

//Create cart
export const createCart = async (res, req) => {
  try {
    //Check for values
    if (!req.body.owner) {
      return res.status(400).json({ message: "Owner id required" });
    }

    //Creat cart object using values
    const newCart = {
      owner: req.body.owner,
    };

    //Save the cart in the db
    const cartCreationStatus = await Cart.create(newCart);

    //Check response and send json message
    if (cartCreationStatus) {
      res.status(202).json({
        message: "Cart created successfully!",
      });
    }
  } catch (error) {
    res.json({
      message: "Error creating cart",
    });
  }
};


// Get cart by user ID
export const getCartByUserId = async (req, res) => {
    try {
      // Extract user ID from the request parameters
      const { userId } = req.params;
  
      // Check if userId is provided
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      // Find the cart associated with the given user ID
      const cart = await Cart.findOne({ owner: userId });
  
      // If no cart is found, return an appropriate response
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
  
      // Return the found cart
      res.status(200).json(cart);
    } catch (error) {
      // Handle any errors that occur during the process
      console.error('Error fetching cart by user ID:', error);
      res.status(500).json({ message: 'Error fetching cart' });
    }
  };