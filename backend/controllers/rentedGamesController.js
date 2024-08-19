import { RentedGames } from "../models/rentedGames.js"; // Adjust path if needed
import { GameStock } from "../models/gameStock.js"; // Adjust path if needed

// Rent a game
export const rentGame = async (req, res) => {
  const { userId, stockid, rentDuration, rentalPrice } = req.body;

  try {
    // Check if the game stock exists and is available
    const gameStock = await GameStock.findById(stockid);
    if (!gameStock) {
      return res.status(404).json({ message: "Game stock not found" });
    }

    // Create a new rental
    const newRental = new RentedGames({
      user: userId,
      stockid: stockid,
      rentDuration: rentDuration,
      rentalPrice: rentalPrice,
    });

    const savedRental = await newRental.save();
    return res.status(201).json(savedRental);
  } catch (error) {
    return res.status(500).json({ message: "Error renting game", error });
  }
};

// Check rental status
export const checkRentalStatus = async (req, res) => {
  const { rentalId } = req.params;

  try {
    const rental = await RentedGames.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    return res.status(200).json({ isActive: rental.isActive });
  } catch (error) {
    return res.status(500).json({ message: "Error checking rental status", error });
  }
};

// End a rental manually
export const endRental = async (req, res) => {
  const { rentalId } = req.params;

  try {
    const rental = await RentedGames.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    rental.isActive = false;
    await rental.save();

    return res.status(200).json({ message: "Rental ended successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error ending rental", error });
  }
};
