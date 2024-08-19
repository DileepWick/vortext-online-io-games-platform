import Rating from '../models/ratingModel.js';
import { Game } from '../models/game.js';
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
    const ratings = await Rating.find({ game: gameId }).populate('user', 'username');
    console.log(`Fetched ${ratings.length} ratings for game ${gameId}`);
    res.json(ratings);
  } catch (error) {
    console.error("Error in getRatings:", error);
    res.status(400).json({ message: error.message });
  }
};