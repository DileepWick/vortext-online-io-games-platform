import { RentalTime } from '../models/rentalDurationModel.js';

export const RentalTimeController = {
  // Add a new rental time for a game
  addRentalTime: async (req, res) => {
    try {
      const { gameId, duration, price } = req.body;

      if (!gameId || !duration || !price) {
        return res.status(400).json({ message: "Game ID, duration, and price are required" });
      }

      const newRentalTime = new RentalTime({
        game: gameId,
        duration,
        price
      });

      const savedRentalTime = await newRentalTime.save();
      res.status(201).json(savedRentalTime);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },


  //get all the rental times
  getAllRentalTimes: async (req, res) => {
    try {
      const rentalTimes = await RentalTime.find()
        .populate('game', 'title') // Populate game field with title
        .sort({ game: 1, duration: 1 }); // Sort by game, then by duration

      const total = await RentalTime.countDocuments();

      res.status(200).json({
        rentalTimes,
        totalItems: total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },




  // Get all rental times for a specific game
  getRentalTimesByGame: async (req, res) => {
    try {
      const { gameId } = req.params;
      const rentalTimes = await RentalTime.find({ game: gameId });
      res.status(200).json(rentalTimes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update a rental time
  updateRentalTime: async (req, res) => {
    try {
      const { id } = req.params;
      const { duration, price } = req.body;

      const updatedRentalTime = await RentalTime.findByIdAndUpdate(
        id,
        { duration, price },
        { new: true, runValidators: true }
      );

      if (!updatedRentalTime) {
        return res.status(404).json({ message: "Rental time not found" });
      }

      res.status(200).json(updatedRentalTime);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete a rental time
  deleteRentalTime: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedRentalTime = await RentalTime.findByIdAndDelete(id);

      if (!deletedRentalTime) {
        return res.status(404).json({ message: "Rental time not found" });
      }

      res.status(200).json({ message: "Rental time deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete all rental times for a specific game
  deleteRentalTimesByGame: async (req, res) => {
    try {
      const { gameId } = req.params;
      const result = await RentalTime.deleteMany({ game: gameId });

      res.status(200).json({ message: `${result.deletedCount} rental times deleted for the game` });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete all rental times (across all games)
  deleteAllRentalTimes: async (req, res) => {
    try {
      const result = await RentalTime.deleteMany({}); // Passing an empty filter to delete all documents

      res.status(200).json({
        message: `${result.deletedCount} rental times deleted successfully`
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  
};