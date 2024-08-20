import express from 'express';
import { createRental,getRentals,getRentalsByUser,deleteRental } from '../controllers/rentals_controller.js';


const RentalRouter = express.Router();

//Create rental
RentalRouter.post("/createRental",createRental);

//fetch rentals
RentalRouter.get("/getAllRentals",getRentals)

//fetch rentals by id
RentalRouter.get("/getRentalsByUser/:userId",getRentalsByUser)

//Delete Rental
RentalRouter.delete("/deleteRentalByID/:id",deleteRental)

export default RentalRouter;