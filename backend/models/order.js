import mongoose from "mongoose";
import { OrderItems } from "./orderItems.js"; // Adjust the import path as necessary

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

// Middleware to delete relevant order items when an order is deleted
orderSchema.pre('findOneAndDelete', async function (next) {
  const order = await this.model.findOne(this.getFilter());
  if (order) {
    await OrderItems.deleteMany({ order: order._id });
  }
  next();
});

orderSchema.pre('deleteOne', { document: true }, async function (next) {
  await OrderItems.deleteMany({ order: this._id });
  next();
});

export const Order = mongoose.model("Order", orderSchema);
