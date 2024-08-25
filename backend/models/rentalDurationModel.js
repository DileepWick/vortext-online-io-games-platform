import mongoose from "mongoose";

const { Schema } = mongoose;

const RentalTimeSchema = new Schema({
  game: {
    type: Schema.Types.ObjectId,
    ref: "Game",
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: [1, 'Duration must be at least 1 minute']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be a positive number']
  }
});

export const RentalTime = mongoose.model("RentalDuration", RentalTimeSchema);