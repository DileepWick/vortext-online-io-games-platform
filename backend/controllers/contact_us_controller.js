import { ContactUsSchema } from "../models/contact_us_model.js";
import { Notification } from "../models/notification_model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export const submitContactForm = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = decodedToken.user.id;
    const { username, email, message } = req.body;

    if (!username || !email || !message || message.trim() === "") {
      return res.status(400).json({
        message: "Username, email, and non-empty message are required",
      });
    }

    // Create a new contact entry for each submission
    const newContact = new ContactUsSchema({
      userId,
      username,
      email,
      messages: [{ sender: "user", content: message }],
      status: "open",
    });

    const createdContact = await newContact.save();

    if (createdContact) {
      return res.status(201).json({
        message: "Contact form submitted successfully",
        contact: createdContact,
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const replyToAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, sender } = req.body; // Add sender to the request body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Contact ID" });
    }

    const contact = await ContactUsSchema.findById(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.messages.push({ sender, content: message });
    contact.updatedAt = new Date();
    await contact.save();

    // Create a notification only if the sender is an agent
    if (sender === "agent") {
      const notification = new Notification({
        userId: contact.userId,
        type: "contact_reply",
        content: "You have received a reply to your contact message",
        contactId: contact._id,
      });
      await notification.save();
    }

    res.status(200).json({
      message: "Reply sent successfully",
      contact: contact,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const replyToContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Contact ID" });
    }

    const contact = await ContactUsSchema.findById(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    contact.messages.push({ sender: "agent", content: message });
    contact.updatedAt = new Date();
    await contact.save();

    // Create a notification for the user
    const notification = new Notification({
      userId: contact.userId,
      type: "contact_reply",
      content: "You have received a reply to your contact message",
      contactId: contact._id,
    });
    await notification.save();

    res.status(200).json({
      message: "Reply sent successfully",
      contact: contact,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const allContacts = await ContactUsSchema.find().sort({ updatedAt: -1 });
    return res.status(200).json({
      allContacts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const fetchContactByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Received userId:", userId);

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Correct usage of ObjectId with 'new'
    const contact = await ContactUsSchema.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ contact });
  } catch (error) {
    console.error("Error fetching contact by userId:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Contact ID" });
    }

    const contact = await ContactUsSchema.findById(id);

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ contact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const setStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the status - allow only "closed"
    if (status !== "closed") {
      return res
        .status(400)
        .json({ message: "Invalid status. Only 'closed' is allowed." });
    }

    // Check if the provided ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Message ID" });
    }

    // Update the status to 'closed' and the updatedAt field
    const updateContactStatus = await ContactUsSchema.findByIdAndUpdate(
      id,
      { status: "closed", updatedAt: new Date() }, // Force status to 'closed'
      { new: true }
    );

    // If no document is found with the given ID
    if (!updateContactStatus) {
      return res.status(404).json({ message: "Message not found!" });
    }

    // Return the updated document
    res.status(200).json({ updateContactStatus });
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
};

// export const updateContact = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid Contact ID" });
//     }

//     const updatedContact = await ContactUsSchema.findByIdAndUpdate(
//       id,
//       { status, updatedAt: new Date() },
//       { new: true }
//     );

//     if (!updatedContact) {
//       return res.status(404).json({ message: "Contact not found" });
//     }

//     res.status(200).json({
//       message: "Contact updated successfully",
//       contact: updatedContact,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "An error occurred", error: error.message });
//   }
// };

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Contact ID" });
    }

    const deletedContact = await ContactUsSchema.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};
