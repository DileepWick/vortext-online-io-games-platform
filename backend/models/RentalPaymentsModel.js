import mongoose from 'mongoose';

const RentalPaymentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  game: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Game', 
    required: true 
  },
  rental: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Rental', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('rentalPayment', RentalPaymentSchema);