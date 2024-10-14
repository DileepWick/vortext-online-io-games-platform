import Rating from "../models/ratingModel.js";
import { Game } from "../models/game.js";
import mongoose from "mongoose";

export const createRating = async (req, res) => {
  try {
    const { user, game, rating, comment } = req.body;
    console.log("Received rating data:", { user, game, rating, comment });

    const newRating = new Rating({ user, game, rating, comment });
    await newRating.save();

    // Update game's average rating
    const gameDoc = await Game.findById(game);
    if (gameDoc) {
      await gameDoc.updateAverageRating();
    }

    console.log("Rating saved successfully");
    res.status(201).json(newRating);
  } catch (error) {
    console.error("Error in createRating:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getRatings = async (req, res) => {
  try {
    const { gameId } = req.params;
    const ratings = await Rating.find({ game: gameId }).populate("user");
    console.log(`Fetched ${ratings.length} ratings for game ${gameId}`);
    res.json(ratings);
  } catch (error) {
    console.error("Error in getRatings:", error);
    res.status(400).json({ message: error.message });
  }
};

// export const getallRatings = async (req, res) => {
//   try {
//     const ratings = await Rating.find().populate('user', 'username');
//     console.log(`Fetched ${ratings.length} `);
//     res.json(ratings);
//   } catch (error) {
//     console.error("Error in getRatings:", error);
//     res.status(500).json({ message: 'There is an error' });
//   }
// };

export const getallRatings = async (req, res) => {
  try {
    // Step 1: Fetch ratings without population
    const unpopulatedRatings = await Rating.find().lean();
    console.log(
      "Unpopulated ratings:",
      JSON.stringify(unpopulatedRatings.slice(0, 2), null, 2)
    );

    // Step 2: Check if game IDs exist and are valid
    const gameIds = unpopulatedRatings
      .map((rating) => rating.game)
      .filter((id) => id);
    console.log("Game IDs from ratings:", gameIds);

    // Step 3: Fetch games directly
    const games = await mongoose
      .model("Game")
      .find({ _id: { $in: gameIds } })
      .lean();
    console.log("Found games:", JSON.stringify(games, null, 2));

    // Step 4: Attempt population
    const ratings = await Rating.find()
      .populate({
        path: "user",
        select: "email username",
      })
      .populate({
        path: "game",
        populate: {
          path: "AssignedGame",
          select: "title",
        },
      });

    console.log(`Fetched ${ratings.length} ratings`);
    console.log(
      "Sample populated rating:",
      JSON.stringify(ratings[0], null, 2)
    );

    res.json(ratings);
  } catch (error) {
    console.error("Error in getAllRatings:", error);
    res
      .status(500)
      .json({ message: "There is an error", error: error.message });
  }
};

export const updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, comment } = req.body;
    console.log("Received updated rating data:", { ratingId, rating, comment });

    const updatedRating = await Rating.findByIdAndUpdate(
      ratingId,
      { rating, comment },
      { new: true }
    );
    if (!updatedRating) {
      throw new Error(`Rating with ID ${ratingId} not found`);
    }

    // Update game's average rating
    const gameDoc = await Game.findById(updatedRating.game);
    if (gameDoc) {
      await gameDoc.updateAverageRating();
    }

    console.log("Rating updated successfully");
    res.json(updatedRating);
  } catch (error) {
    console.error("Error in updateRating:", error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteRatingbyId = async (req, res) => {
  try {
    const { ratingId } = req.params;
    if (!ratingId) {
      throw new Error("Rating ID is required");
    }

    const deletedRating = await Rating.findByIdAndDelete(ratingId);
    if (!deletedRating) {
      throw new Error(`Rating with ID ${ratingId} not found`);
    }

    // Update game's average rating
    const gameDoc = await Game.findById(deletedRating.game);
    if (gameDoc) {
      await gameDoc.updateAverageRating();
    }

    res.status(200).json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Error in deleteRatingbyId:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getNewRatings = async (req, res) => {
  try {
    const ratings = await Rating.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({
        path: "game", // This populates the 'game' field, which is referencing GameStock
        populate: {
          path: "AssignedGame", // This populates the 'AssignedGame' field from GameStock, which references Game
        },
      })
      .populate("user"); // Also populate the 'user' field to get the username

    if (!Array.isArray(ratings)) {
      console.error("Unexpected ratings data type:", typeof ratings);
      return res
        .status(500)
        .json({ message: "Unexpected data format from database" });
    }

    res.json(ratings);
  } catch (error) {
    console.error("Error in getLatestRatings:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteAllRatings = async (req, res) => {
  try {
    // Delete all documents from the ratings collection
    await Rating.deleteMany({});

    res.status(200).json({ message: "All ratings have been deleted." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete ratings.", error });
  }
};
