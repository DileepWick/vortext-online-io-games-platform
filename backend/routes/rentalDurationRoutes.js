import express from 'express';
import { RentalTimeController } from '../controllers/rentalDurationController.js';

const RentalDurationRouter = express.Router();

// Create a rental time
RentalDurationRouter.post("/create", RentalTimeController.addRentalTime);

// Get all rental times for a specific game
RentalDurationRouter.get("/game/:gameId", RentalTimeController.getRentalTimesByGame);

// Update a rental time
RentalDurationRouter.put("/update/:id", RentalTimeController.updateRentalTime);

// Delete a rental time
RentalDurationRouter.delete("/delete/:id", RentalTimeController.deleteRentalTime);

// Delete all rental times for a specific game
RentalDurationRouter.delete("/delete/game/:gameId", RentalTimeController.deleteRentalTimesByGame);


RentalDurationRouter.get("/getalltimes",RentalTimeController.getAllRentalTimes)

RentalDurationRouter.delete("/deleteAll",RentalTimeController.deleteAllRentalTimes)

export { RentalDurationRouter };