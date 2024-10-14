import mongoose from "mongoose";

const { Schema } = mongoose;

const DistributedPaymentSchema = new Schema({
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: "OrderItem", // assuming this refers to your OrderItem model
    required: true,
  },
  developerId: {
    type: Schema.Types.ObjectId,
    ref: "User", // assuming this refers to your User model
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export const DistributedPayment = mongoose.model("DistributedPayment", DistributedPaymentSchema);
