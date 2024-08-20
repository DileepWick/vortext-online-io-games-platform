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
    required: true,
    min: [0, 'Price must be a positive number']
  },
  insertDate: {
    type: Date,
    default: Date.now
  }
});

export const RentalOption = mongoose.model("RentalOption", rentalOptionSchema);