import express from "express";
import {
  submitContactForm,
  getAllContacts,
  getContactById,
  deleteContact,
  replyToContact,
  replyToAgent,
  fetchContactByUserId,
  setStatus,
  generateReport,
  markMessagesAsRead,
} from "../controllers/contact_us_controller.js";
import upload from "../middleware/multer.js";
const contactRouter = express.Router();

// Contact form routes
contactRouter.post(
  "/submitContactForm",
  upload.single("image"), // Use 'single' since you're only uploading one file
  submitContactForm
);
// Optional routes for administrative purposes
contactRouter.get("/fetchContacts", getAllContacts);
contactRouter.get("/fetchContactById/:id", getContactById);
contactRouter.delete("/deleteContact/:id", deleteContact);
contactRouter.post("/reply/:id", replyToContact);
contactRouter.get("/fetchContactByUserId/:userId", fetchContactByUserId);
contactRouter.post("/replyToAgent/:id", replyToAgent);
contactRouter.put("/setStatus/:id", setStatus);
contactRouter.get("/generateReport", generateReport);
contactRouter.put("/markMessagesAsRead/:ticketId", markMessagesAsRead);
export default contactRouter;
