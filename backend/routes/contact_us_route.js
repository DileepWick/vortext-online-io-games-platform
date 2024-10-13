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
} from "../controllers/contact_us_controller.js";

const contactRouter = express.Router();

// Contact form routes
contactRouter.post("/submitContactForm", submitContactForm);

// Optional routes for administrative purposes
contactRouter.get("/fetchContacts", getAllContacts);
contactRouter.get("/fetchContactById/:id", getContactById);
contactRouter.delete("/deleteContact/:id", deleteContact);
contactRouter.post("/reply/:id", replyToContact);
contactRouter.get("/fetchContactByUserId/:userId", fetchContactByUserId);
contactRouter.post("/replyToAgent/:id", replyToAgent);
contactRouter.put("/setStatus/:id", setStatus);
contactRouter.get("/generateReport", generateReport);
export default contactRouter;
