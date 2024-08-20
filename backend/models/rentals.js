import mongoose from "mongoose";

const { Schema } = mongoose;

const RentalSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  game: {
    type: Schema.Types.ObjectId,
    ref: "Game",
    required: true,
  },
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

export const Rental = mongoose.model("Rental", RentalSchema);