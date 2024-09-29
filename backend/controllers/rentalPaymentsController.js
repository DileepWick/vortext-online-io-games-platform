import RentalPayment from '../models/RentalPaymentsModel.js';

export const newRentalPayment = async (req, res) => {
  try {
    const { user, game, rental, amount } = req.body;

    // Create new rental payment
    const newRentalPayment = new RentalPayment({
      user,
      game,
      rental,
      amount
    });

    const savedPayment = await newRentalPayment.save();

    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRentalPayment = async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    const deletedPayment = await RentalPayment.findByIdAndDelete(paymentId);

    if (!deletedPayment) {
      return res.status(404).json({ error: 'Rental payment not found' });
    }

    res.status(200).json({ message: 'Rental payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllRentalPayments = async (req, res) => {
  try {
    const rentalPayments = await RentalPayment.find()
      .populate('user', 'username email')
      .populate('game', 'title')
      .populate('rental', 'time status')
      .sort({ date: -1 });

    const total = rentalPayments.length;

    res.status(200).json({
      rentalPayments,
      totalPayments: total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};