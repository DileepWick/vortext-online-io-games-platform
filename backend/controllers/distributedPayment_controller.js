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
