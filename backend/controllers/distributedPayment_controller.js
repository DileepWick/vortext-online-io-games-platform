import { DistributedPayment } from "../models/DistributedPayment.js";

// Save distributed payment
export const saveDistributedPayment = async (req, res) => {
  const { paymentId, developerId, amount } = req.body;

  try {
    const newPayment = new DistributedPayment({
      paymentId,
      developerId,
      amount,
    });

    await newPayment.save();
    res.status(201).json({ message: "Payment distributed and saved successfully" });
  } catch (error) {
    console.error("Error saving distributed payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get all distributed payments
export const getAllDistributedPayments = async (req, res) => {
  try {
    const payments = await DistributedPayment.find({});
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching distributed payments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all distributed payments for a specific developer
export const getAllDistributedPaymentsForDeveloper = async (req, res) => {
  try {
    const { developerId } = req.params; // Assuming the developerId is passed as a route parameter

    if (!developerId) {
      return res.status(400).json({ message: "Developer ID is required" });
    }

    const payments = await DistributedPayment.find({ developerId })
      .populate('paymentId') // Populate the referenced OrderItem
      .sort({ date: -1 }); // Sort by date in descending order (most recent first)

    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching distributed payments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
