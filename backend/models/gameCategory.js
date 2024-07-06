import mongoose from "mongoose";
const { Schema } = mongoose; // Destructure Schema from mongoose

const gameCategorySchema = Schema({
  categoryName: {
    type: String,
    required: true,
  },
});

export const GameCategory = mongoose.model("GameCategory", gameCategorySchema);