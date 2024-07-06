import mongoose from "mongoose";

const { Schema } = mongoose;

const cartItemsSchema = Schema({
  cartid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
    required: true, // Corrected spelling from "require" to "required"
  },
  stockid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GameStock",
    required: true,
  },
  quantity: { // Corrected field name from "quntity" to "quantity"
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

export const CartItems = mongoose.model("CartItems", cartItemsSchema);
