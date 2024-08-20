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

// Explicitly remove the index if it exists
RentalSchema.index({ time: 1 }, { unique: false });

export const Rental = mongoose.model("Rental", RentalSchema);