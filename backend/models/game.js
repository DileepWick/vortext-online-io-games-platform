import mongoose from "mongoose";
import { GameStock } from "./gameStock.js"; // Adjust the import path as necessary

const { Schema } = mongoose;

const gameSchema = new Schema({
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
  },
  averageRating: { 
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: { 
    type: Number,
    default: 0,
  }
});

// Middleware to delete relevant stocks when a game is deleted
gameSchema.pre('findOneAndDelete', async function (next) {
  const game = await this.model.findOne(this.getFilter());
  if (game) {
    await GameStock.deleteMany({ AssignedGame: game._id });
  }
  next();
});

gameSchema.pre('deleteOne', { document: true }, async function (next) {
  await GameStock.deleteMany({ AssignedGame: this._id });
  next();
});

// Add a method to update the average rating
gameSchema.methods.updateAverageRating = async function() {
  const Rating = mongoose.model('Rating');
  const result = await Rating.aggregate([
    { $match: { game: this._id } },
    { 
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    this.averageRating = result[0].averageRating;
    this.totalRatings = result[0].totalRatings;
    await this.save();
  }
};

export const Game = mongoose.model("Game", gameSchema);
