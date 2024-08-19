import mongoose from "mongoose";

const { Schema } = mongoose;

const rentedGamesSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  stockid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GameStock", 
    required: true,
  },
  rentStartTime: {
    type: Date,
    default: Date.now,
    required: true,
  },
  rentDuration: {
    type: Number, // Duration in minutes
    required: true,
  },
  rentalPrice: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true, // Set to false once time is up
  }
});

// Middleware to automatically block the game when time is up
rentedGamesSchema.pre('save', function (next) {
  const rental = this;
  const endTime = new Date(rental.rentStartTime);
  endTime.setMinutes(endTime.getMinutes() + rental.rentDuration);

  if (new Date() >= endTime) {
    rental.isActive = false; // Block the game when the time is up
  }
  next();
});

export const RentedGames = mongoose.model("RentedGames", rentedGamesSchema);
