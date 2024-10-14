import { ContactUsSchema } from "../models/contact_us_model.js";
import { Notification } from "../models/notification_model.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import cloudinary from "../utils/cloudinary.js";
import multer from "multer";

export const submitContactForm = async (req, res) => {
  try {
    const { userId, username, email, message } = req.body; // Get userId from the request body

    console.log("Form data received:", { userId, username, email, message });

    if (!userId || !username || !email || !message) {
      return res.status(400).json({
        message: "User ID, Username, email, and message are required",
      });
    }

    let imageUrl = null;

    // Process the image upload if an image is uploaded
    if (req.file) {
      console.log("Processing image upload...");
      try {
        const imageResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "contact form images",
          resource_type: "image",
        });

        if (!imageResult || !imageResult.secure_url) {
          return res.status(500).json({
            message: "Image upload failed",
          });
        }

        imageUrl = imageResult.secure_url;
        console.log("Image uploaded to Cloudinary:", imageUrl);

        // Optionally delete the image from the server after upload
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Error uploading image to Cloudinary:", err.message);
        return res.status(500).json({
          message: "Error uploading image",
          error: err.message,
        });
      }
    }

    // Create a new contact form entry with the userId
    const newContact = new ContactUsSchema({
      userId, // Use the userId passed from the frontend
      username,
      email,
      messages: [
        {
          sender: "user",
          content: message,
          image: imageUrl, // Add image URL if uploaded
        },
      ],
      status: "open",
    });

    const createdContact = await newContact.save();
    console.log("Contact form saved successfully:", createdContact);

    return res.status(201).json({
      message: "Contact form submitted successfully",
      contact: createdContact,
    });
  } catch (error) {
    console.error("Error submitting contact form:", error.message);
    res.status(500).json({
      message: "An error occurred while submitting the form",
      error: error.message,
    });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decodedToken;
    try {
      // Verify the token
      decodedToken = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = decodedToken.user.id;
    const { ticketId } = req.params;

    // Find the contact entry by ticket ID and user ID
    const contact = await ContactUsSchema.findOne({ _id: ticketId, userId });

    if (!contact) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Update all unread messages in the contact
    await ContactUsSchema.updateOne(
      { _id: ticketId, "messages.read": false },
      { $set: { "messages.$[msg].read": true } },
      { arrayFilters: [{ "msg.read": false }] } // Only update unread messages
    );

    return res.status(200).json({
      message: "All unread messages marked as read",
      ticketId,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

export const replyToAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, sender } = req.body;

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateReport = async (req, res) => {
  try {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const report = await ContactUsSchema.aggregate([
      {
        $group: {
          _id: "$userId",
          username: { $first: "$username" },
          email: { $first: "$email" },
          ticketCount: { $sum: 1 },
        },
      },
      {
        $sort: { ticketCount: -1 },
      },
    ]);

    if (!report || report.length === 0) {
      return res.status(404).json({ message: "No data found for report" });
    }

    const doc = new PDFDocument();
    const reportsDir = path.resolve(__dirname, "../reports");

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const pageWidth = doc.page.width;
    const pageCenter = pageWidth / 2;
    const now = new Date();

    // Format the date for the filename (YYYY-MM-DD_HH-mm)
    const fileNameDate = now
      .toISOString()
      .slice(0, 16)
      .replace(/T/, "_")
      .replace(/:/g, "-");
    const fileName = `support_report_${fileNameDate}.pdf`;

    // Format the date for display in the report
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    const formattedDate = now.toLocaleString("en-US", options);

    const filePath = path.join(reportsDir, fileName);

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add a background color
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f0f0f0");

    // Add a header
    doc
      .fillColor("#333333")
      .fontSize(28)
      .text("Vortex Gaming", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fillColor("#666666")
      .fontSize(20)
      .text("Support Ticket Report", { align: "center" });
    doc.moveDown(0.5);

    doc
      .fillColor("#999999")
      .fontSize(12)
      .text(`Generated on: ${formattedDate}`, { align: "center" });
    doc.moveDown(1);

    // Table styling
    const tableWidth = 520;
    const tableLeft = (pageWidth - tableWidth) / 2;
    const tableTop = 200;
    const idColumnWidth = 150;
    const usernameColumnWidth = 100;
    const emailColumnWidth = 170;
    const ticketCountColumnWidth = 100;
    const rowHeight = 30;

    const drawLine = (x1, y1, x2, y2) => {
      doc.moveTo(x1, y1).lineTo(x2, y2).stroke();
    };

    // Table header
    doc
      .fillColor("#ffffff")
      .rect(tableLeft, tableTop, tableWidth, rowHeight)
      .fill("#4a4a4a");
    doc.fillColor("#ffffff").fontSize(11);
    doc.text("User ID", tableLeft + 5, tableTop + 10);
    doc.text("Username", tableLeft + idColumnWidth + 5, tableTop + 10);
    doc.text(
      "Email",
      tableLeft + idColumnWidth + usernameColumnWidth + 5,
      tableTop + 10
    );
    doc.text(
      "Ticket Count",
      tableLeft + idColumnWidth + usernameColumnWidth + emailColumnWidth + 5,
      tableTop + 10
    );

    // Draw vertical lines for header
    doc.strokeColor("#ffffff");
    drawLine(
      tableLeft + idColumnWidth,
      tableTop,
      tableLeft + idColumnWidth,
      tableTop + rowHeight
    );
    drawLine(
      tableLeft + idColumnWidth + usernameColumnWidth,
      tableTop,
      tableLeft + idColumnWidth + usernameColumnWidth,
      tableTop + rowHeight
    );
    drawLine(
      tableLeft + idColumnWidth + usernameColumnWidth + emailColumnWidth,
      tableTop,
      tableLeft + idColumnWidth + usernameColumnWidth + emailColumnWidth,
      tableTop + rowHeight
    );

    // Add table rows
    let yPosition = tableTop + rowHeight;
    report.forEach((row, index) => {
      // Alternating row colors
      doc
        .fillColor(index % 2 === 0 ? "#ffffff" : "#f9f9f9")
        .rect(tableLeft, yPosition, tableWidth, rowHeight)
        .fill();

      // Add text
      doc.fillColor("#333333").fontSize(10);
      doc.text(
        row._id.toString().substring(0, 24),
        tableLeft + 5,
        yPosition + 10
      );
      doc.text(row.username, tableLeft + idColumnWidth + 5, yPosition + 10);
      doc.text(
        row.email,
        tableLeft + idColumnWidth + usernameColumnWidth + 5,
        yPosition + 10
      );
      doc.text(
        row.ticketCount.toString(),
        tableLeft + idColumnWidth + usernameColumnWidth + emailColumnWidth + 5,
        yPosition + 10
      );

      // Draw vertical lines for row
      doc.strokeColor("#e0e0e0");
      drawLine(tableLeft, yPosition, tableLeft + tableWidth, yPosition);
      drawLine(
        tableLeft + idColumnWidth,
        yPosition,
        tableLeft + idColumnWidth,
        yPosition + rowHeight
      );
      drawLine(
        tableLeft + idColumnWidth + usernameColumnWidth,
        yPosition,
        tableLeft + idColumnWidth + usernameColumnWidth,
        yPosition + rowHeight
      );
      drawLine(
        tableLeft + idColumnWidth + usernameColumnWidth + emailColumnWidth,
        yPosition,
        tableLeft + idColumnWidth + usernameColumnWidth + emailColumnWidth,
        yPosition + rowHeight
      );

      yPosition += rowHeight;
    });

    doc.end();

    stream.on("finish", () => {
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Error during file download:", err);
          return res
            .status(500)
            .json({ message: "Error downloading the file" });
        } else {
          fs.unlinkSync(filePath);
        }
      });
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Error generating report", error });
  }
};
