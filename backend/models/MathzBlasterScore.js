import mongoose from "mongoose";
const { Schema } = mongoose;

const MathzBlasterScoreSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  highScore: {
    type: Number,
    default: 0,
  },
  playtime: {
    type: Number, // Store playtime in seconds
    default: 0,
  },
  lastPlayed: {
    type: Date,
    default: Date.now,
  },
  level: {
    type: Number,
    default: 1,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add a pre-save middleware to update the 'updatedAt' field
MathzBlasterScoreSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const MathzBlasterScore = mongoose.model(
  "MathzBlasterScore",
  MathzBlasterScoreSchema
);
