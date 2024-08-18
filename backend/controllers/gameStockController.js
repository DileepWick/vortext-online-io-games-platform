import { GameStock } from "../models/gameStock.js";
import { Game } from "../models/game.js";


// Create new game stock
export const createGameStock = async (req, res) => {
  try {
    const {
      UnitPrice,
      discount,
      AssignedGame,
    } = req.body;

    // Validate required fields individually
    if (UnitPrice == null) {
      // Check for both null and undefined
      return res.status(400).json({ message: "Unit Price is required" });
    }

    if (!AssignedGame) {
      return res.status(400).json({ message: "Assigned Game ID is required" });
    }

    // Check if the assigned game exists
    const game = await Game.findById(AssignedGame);
    if (!game) {
      return res.status(404).json({ message: "Assigned game not found" });
    }

    // Check if game is already published
    const existingStock = await GameStock.findOne({
      AssignedGame
    }).populate("AssignedGame");

    if (existingStock) {
      return res.status(405).json({
        message: `Game has already been published`,
      });
    }

    // Create new GameStock object
    const newGameStock = new GameStock({
      AssignedGame,
      UnitPrice,
      discount,
    });

    // Save the new GameStock object in the database
    const savedGameStock = await newGameStock.save();

    // Return success message with the savedGameStock object
    return res.status(201).json({
      message: "Game published successfully !",
      savedGameStock,
    });

  } catch (error) {
    // Handle any errors that occur during the process
    return res.status(500).json({
      message: "Failed to create game stock",
      error: error.message,
    });
  }
};

// Get all game stocks
export const getAllGameStocks = async (req, res) => {
  try {
    const allGameStocks = await GameStock.find().populate('AssignedGame');
    return res.status(200).json({
      total_stocks: allGameStocks.length,
      allGameStocks,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting published games",
      error: error.message,
    });
  }
};

// Get a single game stock by ID
export const getGameStockById = async (req, res) => {
  try {
    const gameStock = await GameStock.findById(req.params.id).populate('AssignedGame');
    if (!gameStock) {
      return res.status(404).json({ message: "Game stock not found" });
    }
    return res.status(200).json(gameStock);
  } catch (error) {
    return res.status(500).json({
      message: "Error getting game stock",
      error: error.message,
    });
  }
};

// Get game stocks by AssignedGame ID
export const getGameStocksByAssignedGameId = async (req, res) => {
  try {
    const gameStocks = await GameStock.find({ AssignedGame: req.params.id }).populate('AssignedGame');
    if (!gameStocks || gameStocks.length === 0) {
      return res.status(404).json({ message: "No game stocks found for the AssignedGame ID" });
    }
    return res.status(200).json(gameStocks);
  } catch (error) {
    return res.status(500).json({
      message: "Error getting game stocks",
      error: error.message,
    });
  }
};


// Update a game stock by ID
export const updateGameStock = async (req, res) => {
  try {
    const { UnitPrice, discount } = req.body;

    // Validate required fields
    if (!UnitPrice || !discount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updatedGameStock = await GameStock.findByIdAndUpdate(
      req.params.id,
      { UnitPrice, discount },
      { new: true } // Return the updated document
    );

    if (!updatedGameStock) {
      return res.status(404).json({ message: "Game stock not found" });
    }

    return res.status(200).json({
      message: "Pricing successful",
      updatedGameStock,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to change pricing",
      error: error.message,
    });
  }
};


// Delete a game stock by ID
export const deleteGameStock = async (req, res) => {
  try {
    const deletedGameStock = await GameStock.findByIdAndDelete(req.params.id);

    if (!deletedGameStock) {
      return res.status(404).json({ message: "Game stock not found" });
    }

    return res.status(200).json({
      message: "Game stock deleted successfully",
      deletedGameStock,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete game stock",
      error: error.message,
    });
  }
};

// Restock units for a game stock by ID
export const restockUnits = async (req, res) => {
  try {
    const { NumberOfUnits } = req.body;

    if (!NumberOfUnits || NumberOfUnits <= 0) {
      return res
        .status(400)
        .json({ message: "Number of units must be a positive number" });
    }

    const gameStock = await GameStock.findById(req.params.id);

    if (!gameStock) {
      return res.status(404).json({ message: "Game stock not found" });
    }

    gameStock.NumberOfUnits += NumberOfUnits;
    const updatedGameStock = await gameStock.save();

    return res.status(200).json({
      message: "Successfully Restocked",
      updatedGameStock,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to restock game units",
      error: error.message,
    });
  }
};

// Add discount to a game stock by ID
export const addDiscount = async (req, res) => {
  try {
    const { discount } = req.body;

    if (discount < 0 || discount > 100) {
      return res
        .status(400)
        .json({ message: "Discount must be between 0 and 100" });
    }

    const updatedGameStock = await GameStock.findByIdAndUpdate(
      req.params.id,
      { discount },
      { new: true, runValidators: true }
    );

    if (!updatedGameStock) {
      return res.status(404).json({ message: "Game stock not found" });
    }

    return res.status(200).json({
      message: "Discount added successfully",
      updatedGameStock,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add discount",
      error: error.message,
    });
  }
};
