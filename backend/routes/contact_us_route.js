import express from "express";
import {
  submitContactForm,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  replyToContact,
  replyToAgent,
  fetchContactByUserId,
  setStatus,
} from "../controllers/contact_us_controller.js";

const contactRouter = express.Router();

// Contact form routes
contactRouter.post("/submitContactForm", submitContactForm);

// Optional routes for administrative purposes
contactRouter.get("/fetchContacts", getAllContacts);
contactRouter.get("/fetchContactById/:id", getContactById);
contactRouter.put("/updateContact/:id", updateContact);
contactRouter.delete("/deleteContact/:id", deleteContact);
contactRouter.post("/reply/:id", replyToContact);
contactRouter.get("/fetchContactByUserId/:userId", fetchContactByUserId);
contactRouter.post("/replyToAgent/:id", replyToAgent);
contactRouter.put("/setStatus/:id", setStatus);
export default contactRouter;
