import { DirectContactUs } from "../models/DirectContactUs.js";
import nodemailer from "nodemailer"; // Add Nodemailer
import dotenv from "dotenv";
import validator from "validator";

dotenv.config();

export const createMessage = async (req, res) => {
  const { email, message } = req.body;

  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address format.",
    });
  }
  try {
    const newMessage = new DirectContactUs({ email, message });
    await newMessage.save();

    // Send confirmation email after successfully saving the message
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Or use another service like SendGrid, Mailgun, etc.
      auth: {
        user: process.env.EMAIL_USER, // Fetch email user from .env
        pass: process.env.EMAIL_PASS, // Fetch email password from .env
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Message Has Been Received",
      html: `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                }
                .header {
                  background-color: #f4f4f4;
                  padding: 10px;
                  text-align: center;
                  border-radius: 5px 5px 0 0;
                }
                .content {
                  padding: 20px 0;
                }
                .message {
                  background-color: #f9f9f9;
                  padding: 15px;
                  border-left: 4px solid #007bff;
                  margin: 10px 0;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 0.9em;
                  color: #777;
                }
                .privacy-notice {
                  background-color: #fff3cd;
                  border: 1px solid #ffeeba;
                  color: #856404;
                  padding: 10px;
                  margin-top: 20px;
                  border-radius: 5px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Thank You for Contacting Us</h2>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>Thank you for contacting our support team. We've received your message and will get back to you shortly.</p>
                  <div class="message">
                    <strong>Your message:</strong>
                    <p>"${message}"</p>
                  </div>
                  <p>We appreciate your patience and will respond as soon as possible.</p>
                  <div class="privacy-notice">
                    <strong>Important:</strong> If you did not submit a message to Vortex Support or if this is not your email address, please disregard this email. Someone may have accidentally entered your email address when contacting us. We respect your privacy and apologize for any inconvenience.
                  </div>
                </div>
                <div class="footer">
                  <p>Best regards,<br>Vortex Support Team</p>
                </div>
              </div>
            </body>
          </html>
        `,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return res.status(201).json({
      success: true,
      message:
        "Message sent! Please check your email for further instructions.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error processing your message." });
  }
};

// Get all messages
export const getMessages = async (req, res) => {
  try {
    const messages = await DirectContactUs.find().sort({ createdAt: -1 }); // Fetch all messages, sorted by creation date (newest first)
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error retrieving messages." });
  }
};

export const deleteAllMessages = async (req, res) => {
  try {
    await DirectContactUs.deleteMany({});
    return res
      .status(200)
      .json({ success: true, message: "All messages have been deleted." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting messages." });
  }
};

// Delete a message by ID
export const deleteMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMessage = await DirectContactUs.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Message deleted successfully." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Error deleting message." });
  }
};
