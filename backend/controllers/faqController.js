// controllers/faqController.js
import { FAQ } from "../models/faq.js";
import mongoose from "mongoose";

// Create new FAQ
export const createFAQ = async (req, res) => {
  try {
    // Check the inputs
    if (!req.body.question || !req.body.answer) {
      return res.status(400).json({
        message: "Question and Answer are required",
      });
    }

    // Create new FAQ object
    const newFAQ = new FAQ({
      question: req.body.question,
      answer: req.body.answer,
    });

    // Save the FAQ in the database
    const createdFAQ = await newFAQ.save();

    // Send success message if FAQ created
    if (createdFAQ) {
      return res.status(201).json({
        message: "FAQ created successfully",
        faq: createdFAQ,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

// Get all FAQs
export const getAllFAQs = async (req, res) => {
  try {
    const allFAQs = await FAQ.find();
    return res.status(200).json({
      allFAQs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get a single FAQ by ID
export const getFAQById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid FAQ ID" });
    }

    const faq = await FAQ.findById(id);

    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json({ faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a FAQ
export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid FAQ ID" });
    }

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
      { question, answer },
      { new: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res
      .status(200)
      .json({ message: "FAQ updated successfully", faq: updatedFAQ });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
};

// Delete a FAQ
export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid FAQ ID" });
    }

    const deletedFAQ = await FAQ.findByIdAndDelete(id);

    if (!deletedFAQ) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", error });
  }
};
