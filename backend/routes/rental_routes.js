import express from 'express';
import { createRental, getRentals, getRentalsByUser, deleteRental, updateRental, updateRentalTime } from '../controllers/rentals_controller.js';

const RentalRouter = express.Router();

// Create rental
RentalRouter.post("/createRental", createRental);

// Fetch rentals
RentalRouter.get("/getAllRentals", getRentals);

// Fetch rentals by id
RentalRouter.get("/getRentalsByUser/:userId", getRentalsByUser);

// Delete Rental
RentalRouter.delete("/deleteRentalByID/:id", deleteRental);

// Update Rental
RentalRouter.put("/updateRental/:id", updateRental);

// Update Rental Time
RentalRouter.put("/updateRentalTime/:id", updateRentalTime);

export default RentalRouter;