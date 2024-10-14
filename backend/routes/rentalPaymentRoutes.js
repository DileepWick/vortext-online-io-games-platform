import express from 'express';
import {
  newRentalPayment,
  deleteRentalPayment,
  getAllRentalPayments,
  getPaymentsByUserId
} from '../controllers/rentalPaymentsController.js';

const rentalPaymentsRouter = express.Router();

// Create a new rental payment
rentalPaymentsRouter.post('/create', newRentalPayment);

// Get all rental payments
rentalPaymentsRouter.get('/', getAllRentalPayments);

// Delete a rental payment
rentalPaymentsRouter.delete('/:paymentId', deleteRentalPayment);

// Get payments by user ID
rentalPaymentsRouter.get('/user/:userId', getPaymentsByUserId);

export default rentalPaymentsRouter;