// controllers/gameController.js
import fs from "fs";
import { Game } from "../models/game.js";
import cloudinary from "../utils/cloudinary.js";


//Add new game
export const uploadGame = async (req, res) => {
  try {
    // Ensure that req.files is defined and contains necessary properties
    if (!req.files || !req.files.image || !req.files.video) {
      return res.status(400).json({
        message: "Image and video files are required",
      });
    }

    // Upload image to Cloudinary
    const imageResult = await cloudinary.uploader.upload(
      req.files.image[0].path,
      {
        folder: "Games cover images",
        resource_type: "image",
      }
    );

    // Upload video to Cloudinary
    const videoResult = await cloudinary.uploader.upload(
      req.files.video[0].path,
      {
        folder: "Games cover images",
        resource_type: "auto",
      }
    );

    // Check required fields
    if (!req.body.title || !req.body.Description || !req.body.Genre || !req.body.PlayLink || !req.body.AgeGroup) {
      // Clean up uploaded files before returning error response
      fs.unlinkSync(req.files.image[0].path);
      fs.unlinkSync(req.files.video[0].path);

      return res.status(400).json({
        message: "Title, description, genre, play link, and age group are required",
      });
    }

    // Create a new game object
    const newGame = new Game({
      title: req.body.title,
      coverPhoto: imageResult.secure_url,
      RatingPoints: req.body.RatingPoints || 0,
      TrailerVideo: videoResult.secure_url,
      Description: req.body.Description,
      Genre: req.body.Genre,
      PlayLink: req.body.PlayLink,
      AgeGroup: req.body.AgeGroup,
    });

    // Save the new game to the database
    const savedGame = await newGame.save();

    // Remove uploaded files from server
    fs.unlinkSync(req.files.image[0].path);
    fs.unlinkSync(req.files.video[0].path);

    return res.status(201).json({
      message: "Game added successfully!",
      game: savedGame,
    });
  } catch (err) {
    console.error("Error uploading game:", err);
    return res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};



//Get all games
export const getAllGames = async (req, res) => {
  try {
    const allGames = await Game.find();
    return res.status(200).json({
      total_games: allGames.length,
      allGames,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting games.",
    });
  }
};

//Get specific game details by id
export const getSpecificGame = async (req, res) => {
  try {
    const gameId = req.params.id;

    const PickedGame = await Game.findById(gameId)
      .populate("Category")
      .populate("Stock");
    return res.status(200).json({
      PickedGame,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting the game.",
    });
  }
};

// Delete game
export const deleteGame = async (req, res) => {
  try {
    const gameId = req.params.id;

    // Find game by ID and delete
    const deletedGame = await Game.findByIdAndDelete(gameId);

    if (!deletedGame) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Optionally, you can delete associated resources like images or videos from Cloudinary

    return res.status(200).json({
      message: "Game deleted successfully",
      deletedGame,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to delete game",
      error: error.message,
    });
  }
};
// Update game
export const updateGame = async (req, res) => {
  try {
    const gameId = req.params.id;

    // Upload image to Cloudinary (if provided)
    let coverPhotoUrl = req.body.coverPhoto;

    if (req.files && req.files.image) {
      const imageResult = await cloudinary.uploader.upload(
        req.files.image[0].path,
        {
          folder: "Games cover images",
          resource_type: "image",
        }
      );
      coverPhotoUrl = imageResult.secure_url;

      // Remove uploaded file from server
      fs.unlinkSync(req.files.image[0].path);
    }

    // Upload video to Cloudinary (if provided)
    let trailerVideoUrl = req.body.trailerVideo; // Assuming trailerVideo is a URL

    if (req.files && req.files.video) {
      const videoResult = await cloudinary.uploader.upload(
        req.files.video[0].path,
        {
          folder: "Games cover images",
          resource_type: "auto",
        }
      );
      trailerVideoUrl = videoResult.secure_url;

      // Remove uploaded file from server
      fs.unlinkSync(req.files.video[0].path);
    }

    // Update game fields
    const updatedFields = {
      title: req.body.title,
      coverPhoto: coverPhotoUrl,
      RatingPoints: req.body.ratingPoints || 0,
      TrailerVideo: trailerVideoUrl,
      Description: req.body.description,
      Genre: req.body.Category.split(",").map((cat) => cat.trim()), // Convert comma-separated string to array
    };

    // Find game by ID and update
    const updatedGame = await Game.findByIdAndUpdate(gameId, updatedFields, {
      new: true, // Return updated document
      runValidators: true, // Run model validators on update
    });

    if (!updatedGame) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Introduce a delay to ensure minimum loading time
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1000 milliseconds = 1 second

    return res.status(200).json({
      message: "Game updated successfully",
      updatedGame,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to update game",
      error: error.message,
    });
  }
};

// Update rating points
export const addRatingPoints = async (req, res) => {
  const gameId = req.params.id;
  const pointsToAdd = parseInt(req.body.pointsToAdd) || 0; // Parse points to add from request body

  try {
    // Find the game by ID
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Calculate new rating points
    const newRatingPoints = game.RatingPoints + pointsToAdd;

    // Update the game with new rating points
    const updatedGame = await Game.findByIdAndUpdate(
      gameId,
      { RatingPoints: newRatingPoints },
      {
        new: true, // Return updated document
        runValidators: true, // Run model validators on update
      }
    );

    if (!updatedGame) {
      return res
        .status(404)
        .json({ message: "Failed to update rating points" });
    }

    return res.status(200).json({
      message: "Rating points updated successfully",
      updatedGame,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to update rating points",
      error: error.message,
    });
  }
};

// Get all games with relevant stock info and category info
export const GamesShop = async (req, res) => {};
