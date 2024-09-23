// routes/messageRoutes.js
import express from "express";
import { sendMessage, getMessages } from "../controllers/messageController.js";

const router = express.Router();

router.post('/send', sendMessage);
router.get('/:userId/:otherUserId', getMessages);

export default router;