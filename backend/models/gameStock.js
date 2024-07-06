import mongoose from "mongoose";

const { Schema } = mongoose;

const gameStockSchema = Schema({
  AssignedGame: {
    type: Schema.Types.ObjectId,
    ref: "Game",
    required:true
  },

  Platform: {
    type: String,
    required: true,
  },
  Edition: {
    type: String,
    required: true,
  },
  NumberOfUnits: {
    type: Number,
    required: true,
  },
  UnitPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
});

export const GameStock = mongoose.model("GameStock", gameStockSchema);
