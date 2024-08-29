import express from "express";
import {
  submitContactForm,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} from "../controllers/contact_us_controller.js";

const contactRouter = express.Router();

// Contact form routes
contactRouter.post("/submitContactForm", submitContactForm);

// Optional routes for administrative purposes
contactRouter.get("/fetchContacts", getAllContacts);
contactRouter.get("/fetchContactById/:id", getContactById);
contactRouter.put("/updateContact/:id", updateContact);
contactRouter.delete("/deleteContact/:id", deleteContact);

export default contactRouter;
