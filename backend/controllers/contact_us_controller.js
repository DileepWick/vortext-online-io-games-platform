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
    // Fetch report data by grouping by userId and calculating the unique ticket count
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

    // Create a new PDF document
    const doc = new PDFDocument();

    // Define file name and path
    const reportsDir = path.resolve(__dirname, "../reports");

    // Check if directory exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir);
    }

    const pageWidth = doc.page.width;
    const pageCenter = pageWidth / 2;
    const now = new Date();
    const timestamp = new Date().getTime();
    const fileName = `support_report_${timestamp}.pdf`;
    const filePath = path.join(reportsDir, fileName);
    const formattedDate = now.toLocaleString();

    // Pipe the PDF to a write stream
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(24).text("Vortex Gaming", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(18).text("Support Ticket Report", { align: "center" });
    doc.moveDown(0.5);

    // Add the generated date and time to the PDF
    doc
      .fontSize(12)
      .text(`Generated on: ${formattedDate}`, { align: "center" });
    doc.moveDown(1);

    // Adjusted table columns
    const tableWidth = 500; // Adjust as needed
    const tableLeft = (pageWidth - tableWidth) / 2;
    const tableTop = 200; // Increased to give more space for titles
    const idColumnWidth = 150;
    const usernameColumnWidth = 100;
    const emailColumnWidth = 150;
    const ticketCountColumnWidth = 100;
    const rowHeight = 30;

    const drawLine = (x1, y1, x2, y2) => {
      doc.moveTo(x1, y1).lineTo(x2, y2).stroke();
    };

    doc.fontSize(10);
    doc.rect(tableLeft, tableTop, tableWidth, rowHeight).stroke();
    doc.text("User ID", tableLeft + 5, tableTop + 5);
    doc.text("Username", tableLeft + idColumnWidth + 5, tableTop + 5);
    doc.text(
      "Email",
      tableLeft + idColumnWidth + usernameColumnWidth + 5,
      tableTop + 5
    );
    doc.text(
      "Ticket Count",
      tableLeft + idColumnWidth + usernameColumnWidth + emailColumnWidth + 5,
      tableTop + 5
    );

    // Draw vertical lines for header
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
      // Draw row
      doc.rect(tableLeft, yPosition, tableWidth, rowHeight).stroke();

      // Add text
      doc.text(
        row._id.toString().substring(0, 24),
        tableLeft + 5,
        yPosition + 5
      );
      doc.text(row.username, tableLeft + idColumnWidth + 5, yPosition + 5);
      doc.text(
        row.email,
        tableLeft + idColumnWidth + usernameColumnWidth + 5,
        yPosition + 5
      );
      doc.text(
        row.ticketCount.toString(),
        tableLeft + idColumnWidth + usernameColumnWidth + emailColumnWidth + 5,
        yPosition + 5
      );

      // Draw vertical lines for row
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

      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;

        // Redraw header on new page
        doc.rect(tableLeft, yPosition, tableWidth, rowHeight).stroke();
        doc.text("User ID", tableLeft + 5, yPosition + 5);
        doc.text("Username", tableLeft + idColumnWidth + 5, yPosition + 5);
        doc.text(
          "Email",
          tableLeft + idColumnWidth + usernameColumnWidth + 5,
          yPosition + 5
        );
        doc.text(
          "Ticket Count",
          tableLeft +
            idColumnWidth +
            usernameColumnWidth +
            emailColumnWidth +
            5,
          yPosition + 5
        );

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
      }
    });

    // Finalize the PDF and end the stream
    doc.end();

    // Wait for the stream to finish before sending the response
    stream.on("finish", () => {
      // Send the PDF file as a downloadable response
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Error during file download:", err);
          return res
            .status(500)
            .json({ message: "Error downloading the file" });
        } else {
          fs.unlinkSync(filePath); // Clean up after sending
        }
      });
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Error generating report", error });
  }
};
