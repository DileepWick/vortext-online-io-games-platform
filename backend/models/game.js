import mongoose from "mongoose";

const { Schema } = mongoose; // Destructure Schema from mongoose

const gameSchema = Schema({
  title: {
    type: String,
    required: true,
  },
  coverPhoto: {
    type: String, // Cloudinary URL
    required: true,
  },
  RatingPoints: {
    type: Number,
    required: true,
    default: 0,
  },
  insertDate: {
    type: Date,
    default: Date.now,
  },
  TrailerVideo: {
    type: String, // Cloudinary URL
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  Genre: {
    type: [String],
    required: true,
  },
  PlayLink: {
    type: String,
    required: true,
  },
  AgeGroup: {
    type: String,
    required: true,
  }
});

export const Game = mongoose.model("Game", gameSchema);
