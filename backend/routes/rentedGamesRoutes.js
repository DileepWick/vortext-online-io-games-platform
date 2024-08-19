import express from "express";
import { rentGame, checkRentalStatus, endRental } from "../controllers/rentedGamesController.js"; // Adjust path if needed

const router = express.Router();

// Route to rent a game
router.post("/rent", rentGame);

// Route to check the rental status
router.get("/status/:rentalId", checkRentalStatus);

// Route to manually end a rental
router.put("/end/:rentalId", endRental);

export default router;
