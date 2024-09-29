import express from 'express';
import {
  newRentalPayment,
  deleteRentalPayment,
  getAllRentalPayments
} from '../controllers/rentalPaymentsController.js';

const rentalPaymentsRouter = express.Router();

// Create a new rental payment
rentalPaymentsRouter.post('/create', newRentalPayment);

// Get all rental payments
rentalPaymentsRouter.get('/', getAllRentalPayments);

// Delete a rental payment
rentalPaymentsRouter.delete('/:paymentId', deleteRentalPayment);

export default rentalPaymentsRouter;