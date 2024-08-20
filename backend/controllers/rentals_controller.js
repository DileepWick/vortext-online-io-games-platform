import { Rental } from '../models/rentals.js';
import { User } from '../models/user.js';
import { Game } from '../models/game.js';

export const createRental = async (req, res) => {
    try {
      const { user, game, time, price } = req.body;
      console.log("Received rental data:", { user, game, time, price });
  
      const newRental = new Rental({ user, game, time, price });
      const savedRental = await newRental.save();
  
      console.log("Rental saved successfully");
      res.status(201).json({
        message: "Rental created successfully!",
        rental: savedRental,
      });
    } catch (error) {
      console.error("Error in createRental:", error);
      res.status(500).json({
        message: error.message || "Error creating rental",
        error: "SERVER_ERROR"
      });
    }
  };

export const getRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate('user', 'username')
      .populate('game', 'title');
    console.log(`Fetched ${rentals.length} rentals`);
    res.json(rentals);
  } catch (error) {
    console.error("Error in getRentals:", error);
    res.status(400).json({ message: error.message });
  }
};



export const getRentalById = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await Rental.findById(id)
      .populate('user', 'username email') // Populate only username and email from user
      .populate({
        path: 'game',
        select: 'PlayLink', // Select specific fields from game
      });

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    console.log(`Fetched rental with id ${id}`);
    res.json(rental);
  } catch (error) {
    console.error("Error in getRentalById:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateRental = async (req, res) => {
  try {
    const { id } = req.params;
    const { time, price } = req.body;
    console.log("Updating rental data:", { id, time, price });

    const updatedRental = await Rental.findByIdAndUpdate(
      id,
      { time, price },
      { new: true, runValidators: true }
    );

    if (!updatedRental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    console.log("Rental updated successfully");
    res.json(updatedRental);
  } catch (error) {
    console.error("Error in updateRental:", error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteRental = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting rental with id ${id}`);

    const deletedRental = await Rental.findByIdAndDelete(id);

    if (!deletedRental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    console.log("Rental deleted successfully");
    res.json({ message: "Rental deleted successfully" });
  } catch (error) {
    console.error("Error in deleteRental:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getRentalsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const rentals = await Rental.find({ user: userId }).populate('game');
    console.log(`Fetched ${rentals.length} rentals for user ${userId}`);
    res.json(rentals);
  } catch (error) {
    console.error("Error in getRentalsByUser:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getRentalsByGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const rentals = await Rental.find({ game: gameId }).populate('user', 'username');
    console.log(`Fetched ${rentals.length} rentals for game ${gameId}`);
    res.json(rentals);
  } catch (error) {
    console.error("Error in getRentalsByGame:", error);
    res.status(400).json({ message: error.message });
  }
};