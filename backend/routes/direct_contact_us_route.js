import express from "express";
import {
  createMessage,
  getMessages,
  deleteAllMessages,
  deleteMessageById,
} from "../controllers/direct_contact_us_controller.js";
const router = express.Router();

// POST route to save a new message
router.post("/submitDirectMessage", createMessage);

// GET route to fetch all messages
router.get("/getDirectMessages", getMessages);
router.delete("/deleteAll", deleteAllMessages);
router.delete("/deleteMessageById/:id", deleteMessageById);

export default router;
