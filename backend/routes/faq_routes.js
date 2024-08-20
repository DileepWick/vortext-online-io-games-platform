// routes/gameRouter.js

import express from "express";
import {
  getAllFAQs,
  createFAQ,
  getFAQById,
  updateFAQ,
  deleteFAQ,
} from "../controllers/faqController.js";

const faqRouter = express.Router();

// FAQ routes
faqRouter.get("/fetchFAQ", getAllFAQs);
faqRouter.post("/createFAQ", createFAQ);
faqRouter.get("/fetchFAQById/:id", getFAQById);
faqRouter.put("/updateFAQ/:id", updateFAQ);
faqRouter.delete("/deleteFAQ/:id", deleteFAQ);

export default faqRouter;
