import express from 'express';
import { createRental, getRentals, getRentalsByUser, deleteRental, updateRental, updateRentalTime, getLatestRental, checkExistingRental, extendRentalTime } from '../controllers/rentals_controller.js';

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


//get latest rental
RentalRouter.get("/getLatestRental/:userId/:gameId", getLatestRental);

//check existing rental
RentalRouter.get('/checkExistingRental/:userId/:gameId', checkExistingRental);


//update rental time
RentalRouter.put('/extendRentalTime/:userId/:gameId', extendRentalTime);

export default RentalRouter;