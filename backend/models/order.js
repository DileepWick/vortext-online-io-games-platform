import mongoose from "mongoose";

const { Schema } = mongoose;

const orderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paymentAmount: {
    type: Number,
    required: true,
  },
  orderPlacementDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});


export const Order = mongoose.model("Order", orderSchema);
