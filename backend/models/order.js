import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

// Custom alphabet for generating a unique 4-length code (letters and numbers)
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 4);

const { Schema } = mongoose;

const orderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  paymentAmount: {
    type: Number,
    required: true,
  },
  orderCompletionCode: {
    type: String,
    default: () => nanoid(),
    unique: true,
    required: true,
  },
  orderPlacementDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ["Pending", "Approved", "On Delivery", "Delivered","Canceled"],
    default: "Pending",
    required: true,
  },
  cancellationReason: {
    type: String,
    required: function () {
      return this.orderStatus === "Canceled";
    },
  },
  courier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});


export const Order = mongoose.model("Order", orderSchema);
