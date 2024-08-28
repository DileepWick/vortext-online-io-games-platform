// controllers/contactController.js

// Import necessary modules and models
import { ContactUsSchema } from "../models/contact_us_model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

/**
 * Submit a new contact form
 * @route POST /contacts/submitContactForm
 * @access Private - requires valid JWT token
 */
export const submitContactForm = async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify and decode the token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Extract user ID from the decoded token
    const userId = decodedToken.id;

    // Extract form data from request body
    const { username, email, message } = req.body;

    // Validate input
    if (!username || !email || !message || message.trim() === "") {
      return res.status(400).json({
        message: "Username, email, and non-empty message are required",
      });
    }

    // Create new ContactUs object
    const newContact = new ContactUsSchema({
      userId,
      username,
      email,
      message,
    });

    // Save the contact in the database
    const createdContact = await newContact.save();

    // Send success response
    if (createdContact) {
      return res.status(201).json({
        message: "Contact form submitted successfully",
        contact: createdContact,
      });
    }
  } catch (error) {
    // Log error and send error response
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

/**
 * Get all contacts
 * @route GET /contacts
 * @access Private - typically for admin use
 */
export const getAllContacts = async (req, res) => {
  try {
    // Fetch all contacts from the database
    const allContacts = await ContactUsSchema.find();
    return res.status(200).json({
      allContacts,
    });
  } catch (error) {
    // Log error and send error response
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

/**
 * Get a single contact by ID
 * @route GET /contacts/:id
 * @access Private - typically for admin use
 */
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Contact ID" });
    }

    // Find contact by ID
    const contact = await ContactUsSchema.findById(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // Send success response with contact data
    res.status(200).json({ contact });
  } catch (error) {
    // Log error and send error response
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update a contact
 * @route PUT /contacts/:id
 * @access Private - typically for admin use
 */
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, message } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Contact ID" });
    }

    // Update contact in the database
    const updatedContact = await ContactUsSchema.findByIdAndUpdate(
      id,
      { username, email, message },
      { new: true } // Return the updated document
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // Send success response with updated contact data
    res.status(200).json({
      message: "Contact updated successfully",
      contact: updatedContact,
    });
  } catch (error) {
    // Log error and send error response
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

/**
 * Delete a contact
 * @route DELETE /contacts/:id
 * @access Private - typically for admin use
 */
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Contact ID" });
    }

    // Delete contact from the database
    const deletedContact = await ContactUsSchema.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // Send success response
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    // Log error and send error response
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
