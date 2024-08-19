import mongoose from "mongoose";

const { Schema } = mongoose;

const rentalOptionSchema = new Schema({
  time: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  insertDate: {
    type: Date,
    default: Date.now
  }
});

export const RentalOption = mongoose.model("RentalOption", rentalOptionSchema);